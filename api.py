from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
import pickle
import os
import pandas as pd
from model import GPFTModel

app = FastAPI(title="GPFT API", description="Generalized Public Fraud Transformer API")

# Load Artifacts
ARTIFACT_DIR = "/Users/aadvikchaturvedi/.gemini/antigravity/brain/0d0f13a6-4fd9-4456-8990-5b96a882564a"
MODEL_PATH = os.path.join(ARTIFACT_DIR, "gpft_model.pth")
PREPROC_PATH = os.path.join(ARTIFACT_DIR, "preprocessors.pkl")

class LogEntry(BaseModel):
    agency: str
    vendor_id: str
    contract_type: str
    amount: float
    description: str

# Global variables for model and preprocessors
model = None
preprocessors = None

@app.on_event("startup")
def load_artifacts():
    global model, preprocessors
    if not os.path.exists(MODEL_PATH) or not os.path.exists(PREPROC_PATH):
        print("Warning: Model or Preprocessors not found. Please train model first.")
        return

    with open(PREPROC_PATH, "rb") as f:
        preprocessors = pickle.load(f)
        
    num_agencies = len(preprocessors['le_agency'].classes_)
    num_vendors = len(preprocessors['le_vendor'].classes_)
    num_types = len(preprocessors['le_type'].classes_)
    vocab_size = preprocessors['vocab_size']
    
    model = GPFTModel(num_agencies, num_vendors, num_types, vocab_size)
    model.load_state_dict(torch.load(MODEL_PATH))
    model.eval()
    print("Model loaded successfully.")

@app.post("/predict")
def predict_fraud(entry: LogEntry):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
        
    try:
        # Preprocess
        # Handle unseen labels by assigning a default or erroring?
        # For demo, we'll try/except and assign a consistent unknown index if possible,
        # but LabelEncoder doesn't support unknown well. We'll use a hack or just error.
        # Hack: map to 0 if unknown.
        
        def transform_safe(le, val):
            try:
                return le.transform([val])[0]
            except ValueError:
                return 0 # Default/Unknown
        
        agency_idx = transform_safe(preprocessors['le_agency'], entry.agency)
        vendor_idx = transform_safe(preprocessors['le_vendor'], entry.vendor_id)
        type_idx = transform_safe(preprocessors['le_type'], entry.contract_type)
        
        amount_scaled = preprocessors['scaler'].transform([[entry.amount]])[0][0]
        
        # Text
        tokens = [hash(w) % preprocessors['vocab_size'] for w in entry.description.split()]
        desc_tensor = torch.tensor(tokens, dtype=torch.long).unsqueeze(0) # (1, Seq)
        
        # Tensors
        t_agency = torch.tensor([agency_idx], dtype=torch.long)
        t_vendor = torch.tensor([vendor_idx], dtype=torch.long)
        t_type = torch.tensor([type_idx], dtype=torch.long)
        t_amount = torch.tensor([[amount_scaled]], dtype=torch.float)
        
        # Predict
        with torch.no_grad():
            outputs = model(t_agency, t_vendor, t_type, t_amount, desc_tensor)
            loss = model.compute_loss(outputs, {
                'agency': t_agency,
                'vendor': t_vendor,
                'type': t_type,
                'amount': t_amount
            })
            # Wait, compute_loss needs targets. We are calculating "Reconstruction Error" = Anomaly Score.
            # We can reuse compute_loss but we need to pass the inputs as targets.
            # The simplified compute_loss I wrote uses the inputs as targets (from batch dict).
            # I can construct a dummy batch dict.
            
            # Re-implement loss calculation for single instance manually for clarity or constructing dict.
            # Let's construct dict.
            batch = {
                'agency': t_agency,
                'vendor': t_vendor,
                'type': t_type,
                'amount': t_amount
            }
            # Note: compute_loss also used outputs['desc'] vs outputs['orig_desc_emb']
            # My current compute_loss expects 'desc' in targets? No, it uses outputs['orig_desc_emb'].
            # Check model.py:
            # loss_desc = F.mse_loss(outputs['r_desc_emb'], outputs['orig_desc_emb'].detach())
            # So we don't need 'desc' in targets for loss calculation of text.
            
            anomaly_score = loss.item()
            
        return {
            "anomaly_score": anomaly_score,
            "is_anomaly": anomaly_score > 1.0 # Threshold TBD
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
