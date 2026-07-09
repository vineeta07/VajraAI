import os
import sys
import pickle
import numpy as np
import pandas as pd
from tqdm import tqdm
from typing import List, Dict, Tuple, Optional
from collections import defaultdict

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler

from sklearn.metrics import roc_auc_score, average_precision_score
from sklearn.preprocessing import StandardScaler

from dtypes import (
    CAT_COLS, NUM_COLS, V_COLS, TARGET, ID_COLS, DTYPE_MAP,
    get_dtypes, add_time_features, add_time_delta_features,
    add_velocity_features_fast, merge_identity,
    HIGH_SIGNAL_ID_COLS, ID_COLS_EXTRA,
    IDENTITY_NUM_COLS, IDENTITY_CAT_COLS,
    APP_CAT_COLS, ALL_CAT_COLS, APP_NUM_COLS,
    FrequencyEncoder,
)

DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {DEVICE}")
import warnings
warnings.filterwarnings('ignore', category=UserWarning, module='pandas')

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'ieee-fraud-detection')
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

# Synthetic app-native field pools
SYNTHETIC_DEPARTMENTS = ['Engineering', 'Finance', 'Marketing', 'Operations', 'Sales', 'HR', 'IT', 'Legal', 'R&D', 'Support']
SYNTHETIC_LOCATIONS = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose']
SYNTHETIC_VENDOR_IDS = [f'VENDOR_{i:03d}' for i in range(1, 101)]


def add_synthetic_app_fields(df: pd.DataFrame, missing_prob: float = 0.05) -> pd.DataFrame:
    n = len(df)
    np.random.seed(42)
    depts = np.random.choice(SYNTHETIC_DEPARTMENTS, size=n)
    locs = np.random.choice(SYNTHETIC_LOCATIONS, size=n)
    vids = np.random.choice(SYNTHETIC_VENDOR_IDS, size=n)
    if missing_prob > 0:
        dept_mask = np.random.random(n) < missing_prob
        loc_mask = np.random.random(n) < missing_prob
        vid_mask = np.random.random(n) < missing_prob
        depts[dept_mask] = 'MISSING'
        locs[loc_mask] = 'MISSING'
        vids[vid_mask] = 'MISSING'
    df['department'] = depts
    df['location'] = locs
    df['vendor_id'] = vids
    return df


# ---------------------------------------------------------------------------
# 1. MISSING AUGMENTATION
# ---------------------------------------------------------------------------

def add_missing_augmentation(cat_tensor: torch.Tensor, p: float = 0.1) -> torch.Tensor:
    if p <= 0.0:
        return cat_tensor
    mask = torch.rand(cat_tensor.shape, device=cat_tensor.device) < p
    cat_tensor = cat_tensor.clone()
    cat_tensor[mask] = 0
    return cat_tensor


# ---------------------------------------------------------------------------
# 2. FEATURE ENGINEERING PIPELINE
# ---------------------------------------------------------------------------

def build_feature_pipeline(df: pd.DataFrame, freq_encoder: FrequencyEncoder = None) -> Tuple[pd.DataFrame, FrequencyEncoder]:
    is_train = freq_encoder is None
    df = df.copy()

    df = add_time_features(df)
    df = add_time_delta_features(df, group_col='card1')
    df = add_velocity_features_fast(df, group_cols=['card1', 'card4', 'addr1'])

    high_card_cats = CAT_COLS.copy()
    usable_cats = [c for c in high_card_cats if c in df.columns]

    from dtypes import IDENTITY_CAT_COLS as _IDENTITY_CAT_COLS
    all_identity_cats = ['DeviceType', 'DeviceInfo'] + [c for c in _IDENTITY_CAT_COLS if c.startswith('id_')]
    for c in all_identity_cats:
        if c in df.columns:
            usable_cats.append(c)
            df[c] = df[c].fillna('UNK')

    for c in APP_CAT_COLS:
        if c in df.columns:
            usable_cats.append(c)
            df[c] = df[c].fillna('MISSING')

    for c in usable_cats:
        if c in df.columns:
            if isinstance(df[c].dtype, pd.CategoricalDtype):
                df[c] = df[c].cat.add_categories(['NAN']).fillna('NAN')
            else:
                df[c] = df[c].fillna('NAN')

    if is_train:
        freq_encoder = FrequencyEncoder(min_count=5)
        freq_encoder.fit(df, usable_cats)
    df = freq_encoder.transform(df, usable_cats)

    return df, freq_encoder


# ---------------------------------------------------------------------------
# 3. DATASET
# ---------------------------------------------------------------------------

class IEEE802Dataset(Dataset):
    def __init__(self, df: pd.DataFrame, cat_cols: List[str], num_cols: List[str],
                 cat_vocab_sizes: Dict[str, int], target_col: str = TARGET,
                 is_test: bool = False, sample_weights: Optional[np.ndarray] = None,
                 missing_aug_p: float = 0.0):
        self.is_test = is_test
        self.missing_aug_p = missing_aug_p if not is_test else 0.0
        self.cat_cols = [c for c in cat_cols if c in df.columns]
        self.num_cols = [c for c in num_cols if c in df.columns]

        self.cat_data = {}
        for c in self.cat_cols:
            self.cat_data[c] = torch.tensor(df[c].values, dtype=torch.long)

        self.num_data = {}
        for c in self.num_cols:
            self.num_data[c] = torch.tensor(df[c].values.astype(np.float32), dtype=torch.float32)

        self.cat_vocab_sizes = {c: cat_vocab_sizes[c] for c in self.cat_cols}

        if not is_test:
            self.targets = torch.tensor(df[target_col].values.astype(np.float32), dtype=torch.float32)

        if sample_weights is not None:
            self.weights = torch.tensor(sample_weights, dtype=torch.float32)
        else:
            self.weights = None

    def __len__(self):
        return len(self.cat_data[self.cat_cols[0]])

    def __getitem__(self, idx):
        cat_vals = torch.cat([self.cat_data[c][idx].unsqueeze(0) for c in self.cat_cols])
        num_vals = torch.cat([self.num_data[c][idx].unsqueeze(0) for c in self.num_cols])
        if self.is_test:
            return cat_vals, num_vals
        target = self.targets[idx]
        if self.weights is not None:
            return cat_vals, num_vals, target, self.weights[idx]
        return cat_vals, num_vals, target


# ---------------------------------------------------------------------------
# 4. DYNAMIC EMBEDDING + TABULAR TRANSFORMER
# ---------------------------------------------------------------------------

def embedding_dim(cardinality: int) -> int:
    if cardinality > 50000: return 64
    if cardinality > 10000: return 32
    if cardinality > 1000:  return 16
    if cardinality > 100:   return 8
    return 4


class DynamicEmbedding(nn.Module):
    def __init__(self, vocab_sizes: Dict[str, int]):
        super().__init__()
        self.embeddings = nn.ModuleDict()
        for name, vs in vocab_sizes.items():
            self.embeddings[name] = nn.Embedding(vs, embedding_dim(vs), padding_idx=0)
        self._names = list(self.embeddings.keys())

    @property
    def total_dim(self):
        return sum(e.embedding_dim for e in self.embeddings.values())

    def forward(self, cat_tensors: Dict[str, torch.Tensor]) -> torch.Tensor:
        return torch.cat([self.embeddings[k](cat_tensors[k]) for k in self._names], dim=-1)


class TabularTransformer(nn.Module):
    def __init__(self, cat_vocab_sizes: Dict[str, int], num_numeric: int,
                 d_model=128, num_heads=8, num_layers=4, d_ff=512, dropout=0.1):
        super().__init__()
        self.num_numeric = num_numeric

        self.cat_embedding = DynamicEmbedding(cat_vocab_sizes)
        cat_dim = self.cat_embedding.total_dim

        self.cat_proj = nn.Linear(cat_dim, d_model) if cat_dim != d_model else nn.Identity()
        self.num_proj = nn.Linear(num_numeric, d_model)

        self.cls_token = nn.Parameter(torch.randn(1, 1, d_model) * 0.02)
        self.pos_encoding = nn.Parameter(torch.randn(1, 3, d_model) * 0.02)

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=num_heads,
            dim_feedforward=d_ff, dropout=dropout,
            activation='gelu', batch_first=True,
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)

        self.norm = nn.LayerNorm(d_model)

        self.residual_concat = nn.Linear(d_model + cat_dim + num_numeric, d_model)
        self.classifier = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.GELU(),
            nn.Dropout(dropout * 0.5),
            nn.Linear(d_model, d_model // 2),
            nn.GELU(),
            nn.Dropout(dropout * 0.25),
            nn.Linear(d_model // 2, 1),
        )
        self._init_weights()

    def _init_weights(self):
        for p in self.parameters():
            if p.dim() > 1:
                nn.init.xavier_uniform_(p, gain=0.5)

    def forward(self, cat_values: Dict[str, torch.Tensor], num_values: torch.Tensor):
        cat_emb = self.cat_embedding(cat_values)
        cat_proj = self.cat_proj(cat_emb)
        num_emb = self.num_proj(num_values)

        cls_tokens = self.cls_token.expand(cat_emb.size(0), -1, -1)
        x = torch.stack([cat_proj, num_emb], dim=1)
        x = x + self.pos_encoding[:, :2, :]
        x = torch.cat([cls_tokens, x], dim=1)

        x = self.transformer(x)
        x = self.norm(x)

        cls_out = x[:, 0, :]

        combined = torch.cat([cls_out, cat_emb, num_values], dim=1)
        combined = self.residual_concat(combined)
        logit = self.classifier(combined).squeeze(-1)
        return logit


# ---------------------------------------------------------------------------
# 5. FOCAL LOSS
# ---------------------------------------------------------------------------

class FocalLoss(nn.Module):
    def __init__(self, alpha: float = 0.25, gamma: float = 2.0, reduction: str = 'mean'):
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma
        self.reduction = reduction

    def forward(self, logits: torch.Tensor, targets: torch.Tensor,
                weights: Optional[torch.Tensor] = None) -> torch.Tensor:
        bce = F.binary_cross_entropy_with_logits(logits, targets, reduction='none')
        probs = torch.sigmoid(logits)
        p_t = probs * targets + (1 - probs) * (1 - targets)
        focal_weight = (1 - p_t) ** self.gamma
        alpha_t = self.alpha * targets + (1 - self.alpha) * (1 - targets)
        loss = alpha_t * focal_weight * bce

        if weights is not None:
            loss = loss * weights

        if self.reduction == 'mean':
            return loss.mean()
        elif self.reduction == 'sum':
            return loss.sum()
        return loss


# ---------------------------------------------------------------------------
# 6. EXPANDING WINDOW CROSS-VALIDATION
# ---------------------------------------------------------------------------

def expand_window_cv(df: pd.DataFrame, n_splits: int = 5):
    df = df.sort_values('TransactionDT').reset_index(drop=True)
    n = len(df)
    step = n // n_splits
    splits = []
    for i in range(1, n_splits):
        train_end = step * i
        val_end = step * (i + 1) if i < n_splits - 1 else n
        val_start = train_end
        if val_start >= n:
            break
        splits.append((0, train_end, val_start, min(val_end, n - 1)))
    return splits


# ---------------------------------------------------------------------------
# 7. DATA LOADING
# ---------------------------------------------------------------------------

def load_data(subset: Optional[int] = None) -> pd.DataFrame:
    print("Loading train_transaction.csv...")
    dtypes = get_dtypes()
    used_cols = list(dtypes.keys()) + ['TransactionID', 'TransactionDT', 'isFraud']
    used_cols = [c for c in used_cols if c in pd.read_csv(
        os.path.join(DATA_DIR, 'train_transaction.csv'), nrows=0
    ).columns]

    df = pd.read_csv(
        os.path.join(DATA_DIR, 'train_transaction.csv'),
        usecols=used_cols,
        dtype=dtypes,
        nrows=subset,
    )

    identity_path = os.path.join(DATA_DIR, 'train_identity.csv')
    if os.path.exists(identity_path):
        print("Loading train_identity.csv with missingness indicators...")
        df = merge_identity(df, identity_path)
        print(f"Identity merge complete. {len([c for c in df.columns if '_missing' in c])} missingness indicators added.")

    print(f"Loaded {len(df)} rows, {len(df.columns)} columns. Fraud rate: {df[TARGET].mean():.4f}")
    return df


# ---------------------------------------------------------------------------
# 8. HARD NEGATIVE MINING
# ---------------------------------------------------------------------------

def identify_hard_negatives(model, loader, device, top_k_pct=0.05):
    model.eval()
    hard_neg_indices = []
    sample_probs = []
    sample_targets = []
    sample_indices = []

    with torch.no_grad():
        for batch_idx, (cat_vals, num_vals, targets) in enumerate(tqdm(loader, desc="Hard Negative Mining")):
            cat_dict = {k: v.to(device) for k, v in zip(model.cat_embedding.embeddings.keys(), cat_vals.T)}
            num_vals = num_vals.to(device)
            logits = model(cat_dict, num_vals)
            probs = torch.sigmoid(logits).cpu().numpy()

            start_idx = batch_idx * loader.batch_size
            for j in range(len(targets)):
                idx = start_idx + j
                sample_probs.append(probs[j])
                sample_targets.append(targets[j].item())
                sample_indices.append(idx)

    sample_probs = np.array(sample_probs)
    sample_targets = np.array(sample_targets)

    neg_mask = sample_targets < 0.5
    neg_probs = sample_probs[neg_mask]
    neg_indices = np.array(sample_indices)[neg_mask]

    if len(neg_probs) == 0:
        return []

    threshold = np.percentile(neg_probs, (1.0 - top_k_pct) * 100)
    hard_neg_mask = neg_probs >= threshold
    hard_neg_indices = neg_indices[hard_neg_mask].tolist()

    print(f"  Hard negatives: {len(hard_neg_indices)} / {len(neg_probs)} negatives "
          f"(threshold={threshold:.4f}, max_prob={neg_probs.max():.4f})")
    return hard_neg_indices


def build_hard_negative_weights(n_samples: int, hard_neg_indices: List[int],
                                 base_weight: float = 1.0, hard_weight: float = 5.0) -> np.ndarray:
    weights = np.full(n_samples, base_weight, dtype=np.float32)
    for idx in hard_neg_indices:
        if idx < n_samples:
            weights[idx] = hard_weight
    return weights


# ---------------------------------------------------------------------------
# 9. TRAINING LOOP
# ---------------------------------------------------------------------------

def train_epoch(model, loader, optimizer, criterion, device, missing_aug_p=0.0):
    model.train()
    total_loss = 0
    for batch in tqdm(loader, desc="Train"):
        if len(batch) == 4:
            cat_vals, num_vals, targets, weights = batch
        else:
            cat_vals, num_vals, targets = batch
            weights = None

        if missing_aug_p > 0:
            cat_vals = add_missing_augmentation(cat_vals, p=missing_aug_p)

        cat_dict = {k: v.to(device) for k, v in zip(model.cat_embedding.embeddings.keys(), cat_vals.T)}
        num_vals = num_vals.to(device)
        targets = targets.to(device)
        if weights is not None:
            weights = weights.to(device)

        optimizer.zero_grad()
        logits = model(cat_dict, num_vals)
        loss = criterion(logits, targets, weights)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        total_loss += loss.item()
    return total_loss / len(loader)


@torch.no_grad()
def eval_model(model, loader, device):
    model.eval()
    all_preds = []
    all_targets = []
    for cat_vals, num_vals, targets in tqdm(loader, desc="Eval"):
        cat_dict = {k: v.to(device) for k, v in zip(model.cat_embedding.embeddings.keys(), cat_vals.T)}
        num_vals = num_vals.to(device)
        logits = model(cat_dict, num_vals)
        probs = torch.sigmoid(logits).cpu().numpy()
        all_preds.append(probs)
        all_targets.append(targets.numpy())
    y_pred = np.concatenate(all_preds)
    y_true = np.concatenate(all_targets)
    roc_auc = roc_auc_score(y_true, y_pred)
    pr_auc = average_precision_score(y_true, y_pred)
    return roc_auc, pr_auc, y_pred, y_true


def run_expanding_window_cv(df: pd.DataFrame, cat_cols: List[str], num_cols: List[str],
                            cat_vocab_sizes: Dict[str, int], n_splits: int = 4,
                            batch_size: int = 2048, epochs: int = 10,
                            lr: float = 1e-3, hard_neg_mining: bool = True,
                            hard_neg_top_k: float = 0.05, hard_neg_weight: float = 5.0,
                            missing_aug_p: float = 0.1):
    splits = expand_window_cv(df, n_splits)
    results = []

    for fold, (tr_start, tr_end, val_start, val_end) in enumerate(splits):
        print(f"\n{'='*70}")
        print(f"Fold {fold + 1}/{len(splits)}: train [0:{tr_end}] val [{val_start}:{val_end}]")
        print(f"{'='*70}")

        train_df = df.iloc[tr_start:tr_end].reset_index(drop=True)
        val_df = df.iloc[val_start:val_end].reset_index(drop=True)

        scaler = StandardScaler()
        train_nums = scaler.fit_transform(train_df[num_cols].fillna(0).values.astype(np.float32))
        val_nums = scaler.transform(val_df[num_cols].fillna(0).values.astype(np.float32))

        for i, c in enumerate(num_cols):
            train_df[c] = train_nums[:, i]
            val_df[c] = val_nums[:, i]

        train_dataset_no_weight = IEEE802Dataset(
            train_df, cat_cols, num_cols, cat_vocab_sizes, missing_aug_p=missing_aug_p,
        )
        val_dataset = IEEE802Dataset(val_df, cat_cols, num_cols, cat_vocab_sizes)

        val_loader = DataLoader(val_dataset, batch_size=batch_size * 2, shuffle=False, num_workers=0)

        model = TabularTransformer(
            cat_vocab_sizes=cat_vocab_sizes,
            num_numeric=len(num_cols),
            d_model=128,
            num_heads=8,
            num_layers=4,
            d_ff=512,
            dropout=0.15,
        ).to(DEVICE)

        criterion = FocalLoss(alpha=0.25, gamma=2.0)
        optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-5)
        scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

        best_roc = 0.0
        best_pr = 0.0
        hard_neg_indices = []

        for epoch in range(epochs):
            if hard_neg_mining and epoch > 0 and len(hard_neg_indices) > 0:
                weights = build_hard_negative_weights(
                    len(train_df), hard_neg_indices,
                    base_weight=1.0, hard_weight=hard_neg_weight,
                )
                train_dataset = IEEE802Dataset(
                    train_df, cat_cols, num_cols, cat_vocab_sizes,
                    sample_weights=weights, missing_aug_p=missing_aug_p,
                )
                sampler = WeightedRandomSampler(
                    weights=weights,
                    num_samples=len(weights),
                    replacement=True,
                )
                train_loader = DataLoader(
                    train_dataset, batch_size=batch_size,
                    sampler=sampler, num_workers=0,
                )
            else:
                train_loader = DataLoader(
                    train_dataset_no_weight, batch_size=batch_size,
                    shuffle=True, num_workers=0,
                )

            train_loss = train_epoch(model, train_loader, optimizer, criterion, DEVICE,
                                     missing_aug_p=missing_aug_p)
            roc_auc, pr_auc, y_pred, y_true = eval_model(model, val_loader, DEVICE)
            scheduler.step()

            print(f"  Epoch {epoch + 1}/{epochs} | Loss: {train_loss:.4f} | "
                  f"ROC-AUC: {roc_auc:.4f} | PR-AUC: {pr_auc:.4f}")

            if hard_neg_mining:
                train_eval_loader = DataLoader(
                    train_dataset_no_weight, batch_size=batch_size * 2,
                    shuffle=False, num_workers=0,
                )
                hard_neg_indices = identify_hard_negatives(
                    model, train_eval_loader, DEVICE, top_k_pct=hard_neg_top_k,
                )

            if roc_auc > best_roc:
                best_roc = roc_auc
                best_pr = pr_auc
                torch.save(model.state_dict(), os.path.join(MODEL_DIR, f'model_fold{fold}.pt'))

        results.append({'fold': fold, 'roc_auc': best_roc, 'pr_auc': best_pr})

    print(f"\n{'='*70}")
    print("Cross-Validation Results:")
    for r in results:
        print(f"  Fold {r['fold'] + 1}: ROC-AUC = {r['roc_auc']:.4f}, PR-AUC = {r['pr_auc']:.4f}")
    mean_roc = np.mean([r['roc_auc'] for r in results])
    mean_pr = np.mean([r['pr_auc'] for r in results])
    print(f"  Mean ROC-AUC: {mean_roc:.4f}")
    print(f"  Mean PR-AUC:  {mean_pr:.4f}")

    return results, model


# ---------------------------------------------------------------------------
# 10. FULL PIPELINE
# ---------------------------------------------------------------------------

def main(subset: Optional[int] = None):
    df = load_data(subset=subset)
    df = df.sort_values('TransactionDT').reset_index(drop=True)

    print("Adding synthetic app-native fields...")
    df = add_synthetic_app_fields(df, missing_prob=0.05)

    print("Building feature pipeline...")
    df, freq_encoder = build_feature_pipeline(df, freq_encoder=None)

    usable_cats = [c for c in CAT_COLS if c in df.columns]

    identity_cat_cols = [c for c in IDENTITY_CAT_COLS if c in df.columns]
    usable_cats += identity_cat_cols

    app_cats = [c for c in APP_CAT_COLS if c in df.columns]
    usable_cats += app_cats

    usable_nums = [c for c in NUM_COLS + V_COLS if c in df.columns]
    velocity_cols = [c for c in df.columns if 'tx_count_' in c or 'amt_sum_' in c]
    identity_num_cols = [c for c in IDENTITY_NUM_COLS if c in df.columns]
    missing_cols = [c for c in df.columns if '_missing' in c]

    usable_nums += velocity_cols + identity_num_cols + missing_cols
    usable_nums += ['TransactionHour', 'TransactionDayOfWeek',
                    'HourSin', 'HourCos', 'DowSin', 'DowCos', 'TimeDelta']
    usable_nums = [c for c in usable_nums if c in df.columns]

    cat_vocab_sizes = {}
    for c in usable_cats:
        vocab_size = int(df[c].max()) + 2
        cat_vocab_sizes[c] = vocab_size

    print(f"\nUsing {len(usable_cats)} categorical features ({len(app_cats)} app-native)")
    print(f"Using {len(usable_nums)} numerical features (incl. {len(velocity_cols)} velocity, {len(missing_cols)} missingness)")
    print(f"Total samples: {len(df)}, Fraud rate: {df[TARGET].mean():.4f}")

    results, best_model = run_expanding_window_cv(
        df=df,
        cat_cols=usable_cats,
        num_cols=usable_nums,
        cat_vocab_sizes=cat_vocab_sizes,
        n_splits=4,
        batch_size=2048,
        epochs=12,
        lr=1e-3,
        hard_neg_mining=True,
        hard_neg_top_k=0.05,
        hard_neg_weight=5.0,
        missing_aug_p=0.1,
    )

    print(f"\nBest ROC-AUC across folds: {max(r['roc_auc'] for r in results):.4f}")

    full_model = TabularTransformer(
        cat_vocab_sizes=cat_vocab_sizes,
        num_numeric=len(usable_nums),
        d_model=128,
        num_heads=8,
        num_layers=4,
        d_ff=512,
        dropout=0.15,
    ).to(DEVICE)

    full_model.load_state_dict(torch.load(
        os.path.join(MODEL_DIR, f'model_fold{results[0]["fold"]}.pt'),
        map_location=DEVICE,
    ))

    artifact = {
        'cat_vocab_sizes': cat_vocab_sizes,
        'usable_cats': usable_cats,
        'usable_nums': usable_nums,
        'freq_encoder': freq_encoder,
    }
    torch.save({
        'model_state_dict': full_model.state_dict(),
        'artifact': artifact,
    }, os.path.join(MODEL_DIR, 'ieee_transformer.pt'))

    with open(os.path.join(MODEL_DIR, 'artifact.pkl'), 'wb') as f:
        pickle.dump(artifact, f)

    scaler = StandardScaler()
    scaler.fit(df[usable_nums].fillna(0).values.astype(np.float32))
    with open(os.path.join(MODEL_DIR, 'scaler.pkl'), 'wb') as f:
        pickle.dump(scaler, f)

    print(f"\nModel and artifacts saved to {MODEL_DIR}/")
    print("Next steps for 0.90+ push:")
    print("  - Full 590K dataset with 30+ epochs + early stopping")
    print("  - Identity table (already merged)")
    print("  - Hard negative mining active")
    print("  - Missing augmentation active")
    print("  - Monitor PR-AUC (not just ROC-AUC)")


if __name__ == '__main__':
    subset = None
    if '--subset' in sys.argv:
        idx = sys.argv.index('--subset')
        subset = int(sys.argv[idx + 1])
    main(subset=subset)
