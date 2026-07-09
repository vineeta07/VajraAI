import os
import sys
import pickle
import math
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from dtypes import FrequencyEncoder

_main = sys.modules.get('__main__')
if _main:
    _main.FrequencyEncoder = FrequencyEncoder

# ── Model Architecture (mirrors train_ieee.py) ──────────────────────────────

def embedding_dim(cardinality: int) -> int:
    if cardinality > 50000: return 64
    if cardinality > 10000: return 32
    if cardinality > 1000:  return 16
    if cardinality > 100:   return 8
    return 4

class DynamicEmbedding(nn.Module):
    def __init__(self, vocab_sizes: dict):
        super().__init__()
        self.embeddings = nn.ModuleDict()
        for name, vs in vocab_sizes.items():
            self.embeddings[name] = nn.Embedding(vs, embedding_dim(vs), padding_idx=0)
        self._names = list(self.embeddings.keys())
    @property
    def total_dim(self):
        return sum(e.embedding_dim for e in self.embeddings.values())
    def forward(self, cat_dict: dict) -> torch.Tensor:
        return torch.cat([self.embeddings[k](cat_dict[k]) for k in self._names], dim=-1)

class TabularTransformer(nn.Module):
    def __init__(self, cat_vocab_sizes: dict, num_numeric: int,
                 d_model=128, num_heads=8, num_layers=4, d_ff=512, dropout=0.1):
        super().__init__()
        self.num_numeric = num_numeric
        self.cat_embedding = DynamicEmbedding(cat_vocab_sizes)
        cat_dim = self.cat_embedding.total_dim
        self.cat_proj = nn.Linear(cat_dim, d_model) if cat_dim != d_model else nn.Identity()
        self.num_proj = nn.Linear(num_numeric, d_model)
        self.cls_token = nn.Parameter(torch.randn(1, 1, d_model) * 0.02)
        self.pos_encoding = nn.Parameter(torch.randn(1, 3, d_model) * 0.02)
        enc = nn.TransformerEncoderLayer(d_model, num_heads, d_ff, dropout, 'gelu', batch_first=True)
        self.transformer = nn.TransformerEncoder(enc, num_layers)
        self.norm = nn.LayerNorm(d_model)
        self.residual_concat = nn.Linear(d_model + cat_dim + num_numeric, d_model)
        self.classifier = nn.Sequential(
            nn.LayerNorm(d_model), nn.GELU(), nn.Dropout(dropout * 0.5),
            nn.Linear(d_model, d_model // 2), nn.GELU(), nn.Dropout(dropout * 0.25),
            nn.Linear(d_model // 2, 1),
        )
        self._init_weights()
    def _init_weights(self):
        for p in self.parameters():
            if p.dim() > 1:
                nn.init.xavier_uniform_(p, gain=0.5)
    def forward(self, cat_values: dict, num_values: torch.Tensor):
        cat_emb = self.cat_embedding(cat_values)
        cat_proj = self.cat_proj(cat_emb)
        num_emb = self.num_proj(num_values)
        cls_tokens = self.cls_token.expand(cat_emb.size(0), -1, -1)
        x = torch.stack([cat_proj, num_emb], dim=1) + self.pos_encoding[:, :2, :]
        x = torch.cat([cls_tokens, x], dim=1)
        x = self.norm(self.transformer(x))
        cls_out = x[:, 0, :]
        combined = torch.cat([cls_out, cat_emb, num_values], dim=1)
        return self.classifier(self.residual_concat(combined)).squeeze(-1)


# ── FastAPI ──────────────────────────────────────────────────────────────────

app = FastAPI(title="VajraAI Anomaly Detection Service")

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')


class TransactionInput(BaseModel):
    transaction_id: int
    amount: float
    frequency: float
    avg_amount: float
    estimated_cost: Optional[float] = None
    num_bidders: Optional[int] = None
    card1: Optional[int] = None
    addr1: Optional[int] = None
    card4: Optional[str] = None
    card2: Optional[int] = None
    card3: Optional[float] = None
    card5: Optional[int] = None
    card6: Optional[str] = None
    addr2: Optional[int] = None
    dist1: Optional[float] = None
    dist2: Optional[float] = None
    P_emaildomain: Optional[str] = None
    R_emaildomain: Optional[str] = None
    ProductCD: Optional[str] = None
    M1: Optional[str] = None
    M2: Optional[str] = None
    M3: Optional[str] = None
    M4: Optional[str] = None
    M5: Optional[str] = None
    M6: Optional[str] = None
    M7: Optional[str] = None
    M8: Optional[str] = None
    M9: Optional[str] = None
    DeviceType: Optional[str] = None
    DeviceInfo: Optional[str] = None
    id_12: Optional[float] = None
    id_13: Optional[float] = None
    id_14: Optional[float] = None
    id_15: Optional[float] = None
    id_16: Optional[float] = None
    id_17: Optional[float] = None
    id_31: Optional[float] = None
    id_38: Optional[float] = None


class PredictResponse(BaseModel):
    transaction_id: int
    anomaly_score: float
    risk_level: str


_model: Optional[TabularTransformer] = None
_artifact: Optional[dict] = None
_scaler = None
_device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')


def load_model():
    global _model, _artifact, _scaler
    model_path = os.path.join(MODEL_DIR, 'ieee_transformer.pt')
    artifact_path = os.path.join(MODEL_DIR, 'artifact.pkl')
    scaler_path = os.path.join(MODEL_DIR, 'scaler.pkl')

    if not os.path.exists(model_path):
        print(f"WARNING: No trained model at {model_path}. Running in legacy mode.")
        return False

    with open(artifact_path, 'rb') as f:
        _artifact = pickle.load(f)
    with open(scaler_path, 'rb') as f:
        _scaler = pickle.load(f)

    num_numeric = len(_artifact['usable_nums'])
    _model = TabularTransformer(
        cat_vocab_sizes=_artifact['cat_vocab_sizes'],
        num_numeric=num_numeric,
        d_model=128, num_heads=8, num_layers=4, d_ff=512, dropout=0.15,
    ).to(_device)

    ckpt = torch.load(model_path, map_location=_device, weights_only=False)
    _model.load_state_dict(ckpt['model_state_dict'])
    _model.eval()
    print(f"Model loaded from {model_path} using {_device}")
    return True


@app.on_event("startup")
async def startup():
    load_model()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": _model is not None,
        "device": str(_device),
        "mode": "ieee_transformer" if _model is not None else "legacy_fallback",
    }


@app.post("/detect", response_model=List[PredictResponse])
def detect_anomalies(data: List[TransactionInput]):
    if _model is None or _artifact is None:
        return _legacy_detect(data)

    has_ieee_fields = any(d.card1 is not None for d in data)
    if not has_ieee_fields:
        return _legacy_detect(data)

    usable_nums = _artifact['usable_nums']
    usable_cats = _artifact['usable_cats']
    freq_encoder = _artifact['freq_encoder']

    from dtypes import (
        add_time_features, add_time_delta_features, add_velocity_features_fast,
    )

    rows = []
    for d in data:
        row = {
            'TransactionID': d.transaction_id,
            'TransactionDT': 0,
            'isFraud': 0,
            'TransactionAmt': d.amount,
            'card1': d.card1 or 0,
            'card2': d.card2 or 0,
            'card3': d.card3 or 0.0,
            'card4': d.card4 or 'NAN',
            'card5': d.card5 or 0,
            'card6': d.card6 or 'NAN',
            'addr1': d.addr1 or 0,
            'addr2': d.addr2 or 0,
            'dist1': d.dist1 or 0.0,
            'dist2': d.dist2 or 0.0,
            'P_emaildomain': d.P_emaildomain or 'NAN',
            'R_emaildomain': d.R_emaildomain or 'NAN',
            'ProductCD': d.ProductCD or 'NAN',
            'M1': d.M1 or 'NAN', 'M2': d.M2 or 'NAN', 'M3': d.M3 or 'NAN',
            'M4': d.M4 or 'NAN', 'M5': d.M5 or 'NAN', 'M6': d.M6 or 'NAN',
            'M7': d.M7 or 'NAN', 'M8': d.M8 or 'NAN', 'M9': d.M9 or 'NAN',
            'DeviceType': d.DeviceType or 'UNK',
            'DeviceInfo': d.DeviceInfo or 'UNK',
            'id_12': d.id_12 if d.id_12 is not None else -1.0,
            'id_13': d.id_13 if d.id_13 is not None else -1.0,
            'id_14': d.id_14 if d.id_14 is not None else -1.0,
            'id_15': d.id_15 if d.id_15 is not None else -1.0,
            'id_16': d.id_16 if d.id_16 is not None else -1.0,
            'id_17': d.id_17 if d.id_17 is not None else -1.0,
            'id_31': d.id_31 if d.id_31 is not None else -1.0,
            'id_38': d.id_38 if d.id_38 is not None else -1.0,
        }
        rows.append(row)

    df = pd.DataFrame(rows)
    df['TransactionDT'] = np.arange(len(df)) * 3600 + 86400

    df = add_time_features(df)
    df = add_time_delta_features(df, group_col='card1')
    df = add_velocity_features_fast(df, group_cols=['card1', 'card4', 'addr1'])

    for col in ['id_12', 'id_13', 'id_14', 'id_15', 'id_16', 'id_17', 'id_31', 'id_38']:
        miss_col = f'{col}_missing'
        df[miss_col] = (df[col] < -0.5).astype(np.float32)

    for c in usable_cats:
        if c in df.columns:
            df[c] = df[c].fillna('NAN')

    df = freq_encoder.transform(df, usable_cats)

    for c in usable_nums:
        if c not in df.columns:
            df[c] = 0.0

    cat_np = np.column_stack([df[c].values.astype(np.int64) for c in usable_cats])
    num_np = df[usable_nums].fillna(0.0).values.astype(np.float32)
    num_np = _scaler.transform(num_np)

    cat_tensors = {}
    for i, c in enumerate(usable_cats):
        cat_tensors[c] = torch.tensor(cat_np[:, i], dtype=torch.long, device=_device)

    num_tensor = torch.tensor(num_np, dtype=torch.float32, device=_device)

    with torch.no_grad():
        logits = _model(cat_tensors, num_tensor)
        scores = torch.sigmoid(logits).cpu().numpy()

    high_th = np.percentile(scores, 95) if len(scores) > 1 else 0.8
    med_th = np.percentile(scores, 80) if len(scores) > 1 else 0.5

    results = []
    for i, score in enumerate(scores):
        risk = "HIGH" if score > high_th else ("MEDIUM" if score > med_th else "LOW")
        results.append(PredictResponse(
            transaction_id=data[i].transaction_id,
            anomaly_score=float(score),
            risk_level=risk,
        ))
    return results


# ── Legacy fallback ──────────────────────────────────────────────────────────

def _legacy_detect(data: List[TransactionInput]) -> List[PredictResponse]:
    ids = [d.transaction_id for d in data]
    features = []
    for d in data:
        est_cost = d.estimated_cost if d.estimated_cost is not None else d.amount
        bidders = d.num_bidders if d.num_bidders is not None else 3.0
        features.append([d.amount, d.frequency, d.avg_amount,
                         (d.amount - est_cost) / (est_cost + 1e-9),
                         1.0 / (float(bidders) + 1e-9)])
    X = np.array(features, dtype=np.float32)
    from sklearn.preprocessing import StandardScaler
    leg_scaler = StandardScaler()
    X_scaled = leg_scaler.fit_transform(X)
    legacy_model = _build_legacy_model()
    X_tensor = torch.tensor(X_scaled, dtype=torch.float32).unsqueeze(1)
    with torch.no_grad():
        recon = legacy_model(X_tensor)
    errors = torch.mean((X_tensor - recon) ** 2, dim=(1, 2)).numpy()
    high_th = np.percentile(errors, 95)
    med_th = np.percentile(errors, 85)
    results = []
    for i, score in enumerate(errors):
        risk = "LOW"
        if score > high_th: risk = "HIGH"
        elif score > med_th: risk = "MEDIUM"
        d = data[i]
        if d.num_bidders is not None and d.num_bidders == 1 and d.amount > 10000:
            if risk == "LOW": risk = "MEDIUM"
        results.append(PredictResponse(
            transaction_id=ids[i], anomaly_score=float(score), risk_level=risk,
        ))
    return results


def _build_legacy_model():
    class PositionalEncoding(nn.Module):
        def __init__(self, d_model, max_len=500):
            super().__init__()
            pe = torch.zeros(max_len, d_model)
            position = torch.arange(0, max_len).unsqueeze(1).float()
            div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))
            pe[:, 0::2] = torch.sin(position * div_term)
            pe[:, 1::2] = torch.cos(position * div_term)
            self.register_buffer("pe", pe.unsqueeze(0))
        def forward(self, x):
            return x + self.pe[:, :x.size(1)]
    class LegacyTransformerAutoencoder(nn.Module):
        def __init__(self, num_features, d_model=64, num_heads=4, num_layers=3, d_ff=256, dropout=0.1):
            super().__init__()
            self.embedding = nn.Linear(num_features, d_model)
            self.positional_encoding = PositionalEncoding(d_model)
            enc = nn.TransformerEncoderLayer(d_model, num_heads, d_ff, dropout, batch_first=True)
            self.encoder = nn.TransformerEncoder(enc, num_layers)
            self.decoder = nn.Linear(d_model, num_features)
        def forward(self, x):
            x = self.embedding(x)
            x = self.positional_encoding(x)
            return self.decoder(self.encoder(x))
    m = LegacyTransformerAutoencoder(num_features=5)
    m.eval()
    return m
