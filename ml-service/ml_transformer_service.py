import os
import sys
import pickle
import math
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from dtypes import FrequencyEncoder

_main = sys.modules.get('__main__')
if _main:
    _main.FrequencyEncoder = FrequencyEncoder

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
CORE_APP_FIELDS = ['amount', 'frequency', 'avg_amount', 'estimated_cost', 'num_bidders', 'department', 'location', 'vendor_id']
CORE_IEEE_FIELDS = ['card1', 'addr1', 'card4', 'ProductCD', 'dist1', 'dist2']


# ── Model Architecture ──────────────────────────────────────────────────────

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

app = FastAPI(title="VajraAI Unified Anomaly Detection Service")


class TransactionInput(BaseModel):
    transaction_id: int
    amount: float
    frequency: float
    avg_amount: float
    estimated_cost: Optional[float] = None
    num_bidders: Optional[int] = None
    department: Optional[str] = None
    location: Optional[str] = None
    vendor_id: Optional[str] = None
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
    id_23: Optional[float] = None
    id_27: Optional[float] = None
    id_28: Optional[float] = None
    id_29: Optional[float] = None
    id_30: Optional[float] = None
    id_31: Optional[float] = None
    id_33: Optional[float] = None
    id_34: Optional[float] = None
    id_35: Optional[float] = None
    id_36: Optional[float] = None
    id_37: Optional[float] = None
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
        print(f"No trained model at {model_path}. Service will return LOW_CONFIDENCE for all requests.")
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
    sd = ckpt['model_state_dict'] if 'model_state_dict' in ckpt else ckpt
    _model.load_state_dict(sd)
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
    }


# ── Guardrails ──────────────────────────────────────────────────────────────

def _missing_ratio(data: TransactionInput) -> float:
    has_ieee = data.card1 is not None
    has_app = data.department is not None or data.vendor_id is not None
    if has_ieee and not has_app:
        core = CORE_IEEE_FIELDS
    elif has_app and not has_ieee:
        core = CORE_APP_FIELDS
    else:
        core = CORE_APP_FIELDS + CORE_IEEE_FIELDS
    present = 0
    for field in core:
        val = getattr(data, field, None)
        if val is not None and val != 'MISSING':
            present += 1
    return 1.0 - (present / len(core)) if core else 1.0


def _schema_assertion(num_vector_size: int, cat_count: int):
    assert num_vector_size >= 100, f"Numeric feature vector too small: {num_vector_size} < 100"
    assert cat_count >= 25, f"Categorical feature count too small: {cat_count} < 25"


# ── Unified Detection ───────────────────────────────────────────────────────

@app.post("/detect", response_model=List[PredictResponse])
def detect_anomalies(data: List[TransactionInput]):
    return _unified_detect(data)


def _unified_detect(data: List[TransactionInput]) -> List[PredictResponse]:
    if _model is None or _artifact is None:
        return [PredictResponse(
            transaction_id=d.transaction_id,
            anomaly_score=0.0,
            risk_level="LOW_CONFIDENCE",
        ) for d in data]

    usable_nums = _artifact['usable_nums']
    usable_cats = _artifact['usable_cats']
    freq_encoder = _artifact['freq_encoder']

    from dtypes import (
        add_time_features, add_time_delta_features, add_velocity_features_fast,
    )

    def get_val(d, attr, default):
        v = getattr(d, attr, None)
        return v if v is not None else default

    missing_ratios = []
    rows = []
    for d in data:
        mr = _missing_ratio(d)
        missing_ratios.append(mr)

        row = {
            'TransactionID': d.transaction_id,
            'TransactionDT': 0,
            'isFraud': 0,
            'TransactionAmt': get_val(d, 'amount', -1.0),
            'card1': get_val(d, 'card1', 0),
            'card2': get_val(d, 'card2', 0),
            'card3': get_val(d, 'card3', 0.0),
            'card4': get_val(d, 'card4', 'MISSING'),
            'card5': get_val(d, 'card5', 0),
            'card6': get_val(d, 'card6', 'MISSING'),
            'addr1': get_val(d, 'addr1', 0),
            'addr2': get_val(d, 'addr2', 0),
            'dist1': get_val(d, 'dist1', 0.0),
            'dist2': get_val(d, 'dist2', 0.0),
            'P_emaildomain': get_val(d, 'P_emaildomain', 'MISSING'),
            'R_emaildomain': get_val(d, 'R_emaildomain', 'MISSING'),
            'ProductCD': get_val(d, 'ProductCD', 'MISSING'),
            'M1': get_val(d, 'M1', 'MISSING'),
            'M2': get_val(d, 'M2', 'MISSING'),
            'M3': get_val(d, 'M3', 'MISSING'),
            'M4': get_val(d, 'M4', 'MISSING'),
            'M5': get_val(d, 'M5', 'MISSING'),
            'M6': get_val(d, 'M6', 'MISSING'),
            'M7': get_val(d, 'M7', 'MISSING'),
            'M8': get_val(d, 'M8', 'MISSING'),
            'M9': get_val(d, 'M9', 'MISSING'),
            'DeviceType': get_val(d, 'DeviceType', 'MISSING'),
            'DeviceInfo': get_val(d, 'DeviceInfo', 'MISSING'),
            'department': get_val(d, 'department', 'MISSING'),
            'location': get_val(d, 'location', 'MISSING'),
            'vendor_id': get_val(d, 'vendor_id', 'MISSING'),
            'id_12': get_val(d, 'id_12', -1.0),
            'id_13': get_val(d, 'id_13', -1.0),
            'id_14': get_val(d, 'id_14', -1.0),
            'id_15': get_val(d, 'id_15', -1.0),
            'id_16': get_val(d, 'id_16', -1.0),
            'id_17': get_val(d, 'id_17', -1.0),
            'id_23': get_val(d, 'id_23', -1.0),
            'id_27': get_val(d, 'id_27', -1.0),
            'id_28': get_val(d, 'id_28', -1.0),
            'id_29': get_val(d, 'id_29', -1.0),
            'id_30': get_val(d, 'id_30', -1.0),
            'id_31': get_val(d, 'id_31', -1.0),
            'id_33': get_val(d, 'id_33', -1.0),
            'id_34': get_val(d, 'id_34', -1.0),
            'id_35': get_val(d, 'id_35', -1.0),
            'id_36': get_val(d, 'id_36', -1.0),
            'id_37': get_val(d, 'id_37', -1.0),
            'id_38': get_val(d, 'id_38', -1.0),
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
        if c not in df.columns:
            df[c] = 'MISSING'

    for c in usable_nums:
        if c not in df.columns:
            df[c] = -1.0

    df = freq_encoder.transform(df, usable_cats)

    cat_np = np.column_stack([df[c].values.astype(np.int64) for c in usable_cats])
    num_np = df[usable_nums].fillna(-1.0).values.astype(np.float32)
    num_np = _scaler.transform(num_np)

    _schema_assertion(num_np.shape[1], len(usable_cats))

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
        if missing_ratios[i] > 0.5:
            risk = "LOW_CONFIDENCE"
        elif score > high_th:
            risk = "HIGH"
        elif score > med_th:
            risk = "MEDIUM"
        else:
            risk = "LOW"
        results.append(PredictResponse(
            transaction_id=data[i].transaction_id,
            anomaly_score=float(score),
            risk_level=risk,
        ))
    return results
