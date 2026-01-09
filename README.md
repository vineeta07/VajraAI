# Generalized Public Fraud Transformer (GPFT)

## Overview
GPFT is a multimodal anomaly detection system designed to identify fraud in government spending, procurement, welfare, and contracts. It utilizes a Transformer Autoencoder architecture to process both numerical spending logs and textual contract descriptions.

## Features
- **Multimodal Input**: Handles numerical and text data via modular adapters.
- **Transformer Autoencoder**: Learns reconstructive patterns to identify anomalies.
- **Synthetic Data Generation**: Simulates public sector spending data including edge cases.
- **FastAPI**: Production-ready inference endpoint.
- **Streamlit Dashboard**: Interactive UI for stress testing.
- **Dockerized**: Deployment ready.

## Installation
```bash
pip install -r requirements.txt
```

## Usage
1. **Train**: `python train.py`
2. **API**: `uvicorn api:app --reload`
3. **Dashboard**: `streamlit run app.py`
