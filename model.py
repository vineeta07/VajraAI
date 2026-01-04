import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import pandas as pd
from torch.utils.data import Dataset, DataLoader
from sklearn.preprocessing import StandardScaler, LabelEncoder
import math

# ============================================================================
# 1. POSITIONAL ENCODING
# ============================================================================
class PositionalEncoding(nn.Module):
    """Adds positional information to transaction sequences"""
    def __init__(self, d_model, max_len=5000):
        super().__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))
        
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)
        self.register_buffer('pe', pe)
    
    def forward(self, x):
        return x + self.pe[:, :x.size(1)]
# ============================================================================
# 2. MULTI-HEAD ATTENTION
# ============================================================================
class MultiHeadAttention(nn.Module):
    """Multi-head self-attention for capturing feature relationships"""
    def __init__(self, d_model, num_heads, dropout=0.1):
        super().__init__()
        assert d_model % num_heads == 0
        
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
        
        self.dropout = nn.Dropout(dropout)
        
    def scaled_dot_product_attention(self, Q, K, V, mask=None):
        """Compute attention scores"""
        attn_scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        
        if mask is not None:
            attn_scores = attn_scores.masked_fill(mask == 0, -1e9)
        
        attn_probs = F.softmax(attn_scores, dim=-1)
        attn_probs = self.dropout(attn_probs)
        
        output = torch.matmul(attn_probs, V)
        return output, attn_probs
    
    def split_heads(self, x):
        batch_size, seq_length, d_model = x.size()
        return x.view(batch_size, seq_length, self.num_heads, self.d_k).transpose(1, 2)
    
    def combine_heads(self, x):
        batch_size, _, seq_length, d_k = x.size()
        return x.transpose(1, 2).contiguous().view(batch_size, seq_length, self.d_model)
    
    def forward(self, Q, K, V, mask=None):
        Q = self.split_heads(self.W_q(Q))
        K = self.split_heads(self.W_k(K))
        V = self.split_heads(self.W_v(V))
        
        attn_output, attn_probs = self.scaled_dot_product_attention(Q, K, V, mask)
        output = self.W_o(self.combine_heads(attn_output))
        
        return output, attn_probs
# ============================================================================
# 3. FEED-FORWARD NETWORK
# ============================================================================
class FeedForward(nn.Module):
    """Position-wise feed-forward network"""
    def __init__(self, d_model, d_ff, dropout=0.1):
        super().__init__()
        self.fc1 = nn.Linear(d_model, d_ff)
        self.fc2 = nn.Linear(d_ff, d_model)
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x):
        return self.fc2(self.dropout(F.relu(self.fc1(x))))
# ============================================================================
# 4. TRANSFORMER ENCODER LAYER
# ============================================================================
class TransformerEncoderLayer(nn.Module):
    """Single transformer encoder layer with self-attention and FFN"""
    def __init__(self, d_model, num_heads, d_ff, dropout=0.1):
        super().__init__()
        self.self_attn = MultiHeadAttention(d_model, num_heads, dropout)
        self.feed_forward = FeedForward(d_model, d_ff, dropout)
        
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        
        self.dropout1 = nn.Dropout(dropout)
        self.dropout2 = nn.Dropout(dropout)
    
    def forward(self, x, mask=None):
        # Self-attention with residual connection
        attn_output, attn_weights = self.self_attn(x, x, x, mask)
        x = self.norm1(x + self.dropout1(attn_output))
        
        # Feed-forward with residual connection
        ff_output = self.feed_forward(x)
        x = self.norm2(x + self.dropout2(ff_output))
        
        return x, attn_weights
# ============================================================================
# 5. COMPLETE FRAUD DETECTION TRANSFORMER
# ============================================================================
class FraudDetectionTransformer(nn.Module):
    """Complete transformer model for fraud detection"""
    def __init__(self, 
                 num_features,
                 d_model=256,
                 num_heads=8,
                 num_layers=6,
                 d_ff=1024,
                 dropout=0.1,
                 num_categories=100):
        super().__init__()
        
        # Input embedding layers
        self.feature_embedding = nn.Linear(num_features, d_model)
        self.category_embedding = nn.Embedding(num_categories, d_model)
        self.positional_encoding = PositionalEncoding(d_model)
        
        # Transformer encoder layers
        self.encoder_layers = nn.ModuleList([
            TransformerEncoderLayer(d_model, num_heads, d_ff, dropout)
            for _ in range(num_layers)
        ])
        
        # Classification head
        self.classifier = nn.Sequential(
            nn.Linear(d_model, d_model // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(d_model // 2, d_model // 4),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(d_model // 4, 1),
            nn.Sigmoid()
        )
        
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, features, categories, mask=None):
        # Embed features
        x = self.feature_embedding(features)
        
        # Add category embeddings if provided
        if categories is not None:
            cat_embed = self.category_embedding(categories)
            x = x + cat_embed
        
        # Add positional encoding
        x = self.positional_encoding(x)
        x = self.dropout(x)
        
        # Pass through transformer layers
        attention_weights = []
        for layer in self.encoder_layers:
            x, attn = layer(x, mask)
            attention_weights.append(attn)
        
        # Global average pooling
        x = x.mean(dim=1)
        
        # Classification
        fraud_prob = self.classifier(x)
        
        return fraud_prob, attention_weights
# ============================================================================
# 6. DATASET CLASS
# ============================================================================
class FraudDataset(Dataset):
    """Dataset for government transaction fraud detection"""
    def __init__(self, data, labels, seq_length=10):
        self.data = data
        self.labels = labels
        self.seq_length = seq_length
        
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        return {
            'features': torch.FloatTensor(self.data[idx]),
            'label': torch.FloatTensor([self.labels[idx]])
        }
# ============================================================================
# 7. TRAINING FUNCTION
# ============================================================================
def train_model(model, train_loader, val_loader, epochs=50, lr=0.001):
    """Train the fraud detection model"""
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    
    criterion = nn.BCELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', patience=5)
    
    best_val_loss = float('inf')
    
    for epoch in range(epochs):
        # Training phase
        model.train()
        train_loss = 0
        train_correct = 0
        train_total = 0
        
        for batch in train_loader:
            features = batch['features'].to(device)
            labels = batch['label'].to(device)
            
            # Add sequence dimension if needed
            if len(features.shape) == 2:
                features = features.unsqueeze(1)
            
            optimizer.zero_grad()
            
            outputs, _ = model(features, categories=None)
            loss = criterion(outputs, labels)
            
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
            predictions = (outputs > 0.5).float()
            train_correct += (predictions == labels).sum().item()
            train_total += labels.size(0)
        
        # Validation phase
        model.eval()
        val_loss = 0
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            for batch in val_loader:
                features = batch['features'].to(device)
                labels = batch['label'].to(device)
                
                if len(features.shape) == 2:
                    features = features.unsqueeze(1)
                
                outputs, _ = model(features, categories=None)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item()
                predictions = (outputs > 0.5).float()
                val_correct += (predictions == labels).sum().item()
                val_total += labels.size(0)
        
        train_loss /= len(train_loader)
        val_loss /= len(val_loader)
        train_acc = 100 * train_correct / train_total
        val_acc = 100 * val_correct / val_total
        
        scheduler.step(val_loss)
        
        print(f'Epoch {epoch+1}/{epochs}:')
        print(f'  Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}%')
        print(f'  Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%')
        
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), 'best_fraud_model.pth')
            print('  → Model saved!')
        print()

# ============================================================================
# 8. INFERENCE FUNCTION
# ============================================================================
def detect_fraud(model, transaction_data, threshold=0.5):
    """Detect fraud in new transactions"""
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    model.eval()
    
    with torch.no_grad():
        features = torch.FloatTensor(transaction_data).unsqueeze(0).to(device)
        if len(features.shape) == 2:
            features = features.unsqueeze(1)
        
        fraud_prob, attention_weights = model(features, categories=None)
        
        is_fraud = fraud_prob.item() > threshold
        
        # Extract attention patterns for explainability
        attn_pattern = attention_weights[-1][0].mean(dim=0).cpu().numpy()
        
        return {
            'fraud_probability': fraud_prob.item(),
            'is_fraud': is_fraud,
            'attention_weights': attn_pattern,
            'risk_level': 'HIGH' if fraud_prob.item() > 0.7 else 
                         'MEDIUM' if fraud_prob.item() > 0.4 else 'LOW'
        }

# ============================================================================
# 9. EXAMPLE USAGE
# ============================================================================
def main():
    """Example usage of the fraud detection system"""
    
    # Generate synthetic data
    print("Generating synthetic transaction data...")
    np.random.seed(42)
    
    num_samples = 1000
    num_features = 15  # amount, vendor_id, category_id, dept_id, temporal features, etc.
    
    # Normal transactions
    normal_data = np.random.randn(800, num_features)
    normal_labels = np.zeros(800)
    
    # Fraudulent transactions (with anomalous patterns)
    fraud_data = np.random.randn(200, num_features) * 2 + 1  # Higher variance and mean
    fraud_labels = np.ones(200)
    
    # Combine and shuffle
    X = np.vstack([normal_data, fraud_data])
    y = np.hstack([normal_labels, fraud_labels])
    
    indices = np.random.permutation(num_samples)
    X = X[indices]
    y = y[indices]
    
    # Split data
    split = int(0.8 * num_samples)
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]
    
    # Create datasets
    train_dataset = FraudDataset(X_train, y_train)
    val_dataset = FraudDataset(X_val, y_val)
    
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)
    
    # Initialize model
    print("\nInitializing Transformer model...")
    model = FraudDetectionTransformer(
        num_features=num_features,
        d_model=256,
        num_heads=8,
        num_layers=6,
        d_ff=1024,
        dropout=0.1
    )
    
    print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
    
    # Train model
    print("\nTraining model...")
    train_model(model, train_loader, val_loader, epochs=10, lr=0.001)
    
    # Test inference
    print("\nTesting fraud detection on sample transaction...")
    test_transaction = np.random.randn(1, num_features)
    result = detect_fraud(model, test_transaction)
    
    print(f"\nFraud Detection Results:")
    print(f"  Fraud Probability: {result['fraud_probability']:.4f}")
    print(f"  Classification: {'FRAUD' if result['is_fraud'] else 'LEGITIMATE'}")
    print(f"  Risk Level: {result['risk_level']}")
    print(f"  Attention Weights Shape: {result['attention_weights'].shape}")

if __name__ == "__main__":
    main()