#!/bin/bash
# Train the IEEE-CIS Transformer model
# Usage: ./run_train.sh [--subset N]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== VajraAI: Training IEEE-CIS TabularTransformer ==="
echo "Device: $(python3 -c 'import torch; print("CUDA" if torch.cuda.is_available() else "CPU")')"
echo ""

cd "$SCRIPT_DIR"

python3 train_ieee.py "$@"

echo ""
echo "=== Training complete ==="
echo "Model saved to: $SCRIPT_DIR/models/ieee_transformer.pt"
echo ""
echo "Start the inference service with:"
echo "  uvicorn ml_transformer_service:app --host 0.0.0.0 --port 8000"
