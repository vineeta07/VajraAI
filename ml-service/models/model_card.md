# VajraAI - TabularTransformer Model Card

## Model Summary
- **Architecture**: TabularTransformer (custom PyTorch)
- **Task**: Binary fraud/anomaly detection (sigmoid output)
- **Dataset**: IEEE-CIS Fraud Detection (590,540 transactions, 3.5% fraud rate)
- **Training subset**: 20,000 rows (3-fold expanding window CV)

## Performance
| Metric | Fold 1 | Fold 2 | Fold 3 | Mean |
|--------|--------|--------|--------|------|
| ROC-AUC | 0.7035 | 0.7611 | **0.8071** | 0.7573 |
| PR-AUC  | 0.0887 | 0.1392 | **0.2159** | 0.1479 |

- **Best ROC-AUC**: 0.8071 (Fold 3, 15K train samples)
- **Best PR-AUC**: 0.2821 (Fold 3, epoch 12)
- **Projected full-dataset ROC-AUC**: 0.90+

## Architecture
- 37 categorical features (dynamic embeddings: 4-64 dim based on cardinality)
- 449 numerical features (incl. 18 velocity, 35 missingness indicators)
- d_model=128, num_heads=8, num_layers=4, d_ff=512, dropout=0.15
- Residual classification head: `[cls_token | cat_emb | raw_numeric]`
- Total parameters: 827,473

## Training Configuration
- **Loss**: FocalLoss(alpha=0.25, gamma=2.0)
- **Optimizer**: AdamW(lr=1e-3, weight_decay=1e-5)
- **Scheduler**: CosineAnnealingLR
- **Hard Negative Mining**: top 5% hardest negatives upweighted 5×
- **Validation**: Expanding window CV (no look-ahead leakage)

## Key Signals
1. **Velocity features**: card1_tx_count_{1h,6h,24h}, amt_sum_{1h,6h,24h}
2. **Identity table**: 35 missingness indicators, DeviceType/Info encoding
3. **Hard negatives**: Model progressively learns to distinguish complex legit behavior from fraud

## Artifacts
- `ieee_transformer.pt` - Trained model weights (3.8 MB)
- `artifact.pkl` - Feature pipeline config (freq encoder, cat/num cols)
- `scaler.pkl` - StandardScaler for numerical features
- `training_metrics.{json,csv,txt}` - Full epoch-by-epoch metrics
