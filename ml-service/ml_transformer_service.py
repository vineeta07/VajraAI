import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import math
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from sklearn.preprocessing import StandardScaler

# ============================================================
# 1. POSITIONAL ENCODING
# ============================================================
class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=500):
        super().__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len).unsqueeze(1).float()
        div_term = torch.exp(
            torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model)
        )
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        self.register_buffer("pe", pe.unsqueeze(0))

    def forward(self, x):
        return x + self.pe[:, :x.size(1)]

# ============================================================
# 2. TRANSFORMER AUTOENCODER
# ============================================================
class TransformerAutoencoder(nn.Module):
    def __init__(
        self,
        num_features,
        d_model=64,
        num_heads=4,
        num_layers=3,
        d_ff=256,
        dropout=0.1
    ):
        super().__init__()

        self.embedding = nn.Linear(num_features, d_model)
        self.positional_encoding = PositionalEncoding(d_model)

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=num_heads,
            dim_feedforward=d_ff,
            dropout=dropout,
            batch_first=True
        )

        self.encoder = nn.TransformerEncoder(
            encoder_layer,
            num_layers=num_layers
        )

        self.decoder = nn.Linear(d_model, num_features)

    def forward(self, x):
        # x: (batch, seq_len, features)
        x_embed = self.embedding(x)
        x_embed = self.positional_encoding(x_embed)
        encoded = self.encoder(x_embed)
        reconstructed = self.decoder(encoded)
        return reconstructed

# ============================================================
# 3. FASTAPI SERVICE
# ============================================================
app = FastAPI(title="Transformer Anomaly Detection Service")

from typing import Optional

class TransactionInput(BaseModel):
    transaction_id: int
    amount: float
    frequency: float
    avg_amount: float
    # New Optional Procurement Fields (Backward Compatible)
    estimated_cost: Optional[float] = None # If None, assumes standard pricing
    num_bidders: Optional[int] = None      # If None, assumes standard competition

# Initialize model
NUM_FEATURES = 5 # Amount, Freq, Avg, Cost_Variance, Bidding_Competition
model = TransformerAutoencoder(num_features=NUM_FEATURES)
model.eval()

scaler = StandardScaler()

# ============================================================
# 4. INFERENCE ENDPOINT
# ============================================================
@app.post("/detect")
def detect_anomalies(data: List[TransactionInput]):
    # Convert input to numpy
    ids = [d.transaction_id for d in data]
    
    features = []
    for d in data:
        # Default Logic for missing procurement data
        est_cost = d.estimated_cost if d.estimated_cost is not None else d.amount
        bidders = d.num_bidders if d.num_bidders is not None else 3.0 # Assume 3 bidders (neutral/good) features
        
        # Feature 1-3: Standard
        f1 = d.amount
        f2 = d.frequency
        f3 = d.avg_amount
        
        # Feature 4: Cost Variance (High Bidding Detection)
        # If amount >> estimated_cost -> High Risk
        # (amount - est) / (est + 1e-9)
        # If no estimated cost, variance is 0 (Neutral)
        cost_variance = (d.amount - est_cost) / (est_cost + 1e-9)
        
        # Feature 5: Competition Score (Bidding Rigging Detection)
        # Fewer bidders = Higher Risk. Invert or just raw?
        # Let's use raw count. Autoencoder learns low count = anomaly if normal is high.
        # Or better: inverse (1/bidders) so 1 bidder = 1.0 (High), 10 bidders = 0.1 (Low)
        competition_risk = 1.0 / (float(bidders) + 1e-9)
        
        features.append([f1, f2, f3, cost_variance, competition_risk])
        
    X = np.array(features)

    # Scale features
    # Note: In real prod, scaler should be pre-fitted on training data.
    # Here we fit on batch for demo purposes.
    X_scaled = scaler.fit_transform(X)

    # Convert to tensor
    X_tensor = torch.tensor(X_scaled, dtype=torch.float32)
    X_tensor = X_tensor.unsqueeze(1)  # seq_len = 1

    with torch.no_grad():
        reconstructed = model(X_tensor)

    # Reconstruction error = anomaly score
    errors = torch.mean((X_tensor - reconstructed) ** 2, dim=(1, 2)).numpy()

    # Thresholds (quantile-based)
    high_th = np.percentile(errors, 95)
    med_th = np.percentile(errors, 85)

    results = []
    for i, score in enumerate(errors):
        # Additional Heuristic for Bidding (optional but good for specific feedback)
        risk = "LOW"
        if score > high_th:
            risk = "HIGH"
        elif score > med_th:
            risk = "MEDIUM"
            
        # Explicit override for blatant bid rigging signs if present
        d = data[i]
        if d.num_bidders is not None and d.num_bidders == 1 and d.amount > 10000:
             # Single bidder on large amount is usually high risk technically
             if risk == "LOW": risk = "MEDIUM"

        results.append({
            "transaction_id": ids[i],
            "anomaly_score": float(score),
            "risk_level": risk,
            # Return parsed derived info for debugging
            "derived_metrics": {
                "overspend_ratio": float((data[i].amount - (data[i].estimated_cost or data[i].amount))),
                "bidders": data[i].num_bidders
            }
        })

    return results
