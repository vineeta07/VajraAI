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

class TransactionInput(BaseModel):
    transaction_id: int
    amount: float
    frequency: float
    avg_amount: float

# Initialize model
NUM_FEATURES = 3
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
    X = np.array([
        [d.amount, d.frequency, d.avg_amount]
        for d in data
    ])

    # Scale features
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
        if score > high_th:
            risk = "HIGH"
        elif score > med_th:
            risk = "MEDIUM"
        else:
            risk = "LOW"

        results.append({
            "transaction_id": ids[i],
            "anomaly_score": float(score),
            "risk_level": risk
        })

    return results
