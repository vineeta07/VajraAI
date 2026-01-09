import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler

class FraudDataset(Dataset):
    def __init__(self, csv_file, tokenizer=None):
        self.data = pd.read_csv(csv_file)
        
        # Preprocessing
        self.le_agency = LabelEncoder()
        self.data['agency_idx'] = self.le_agency.fit_transform(self.data['agency'])
        
        self.le_vendor = LabelEncoder()
        self.data['vendor_idx'] = self.le_vendor.fit_transform(self.data['vendor_id'])
        
        self.le_type = LabelEncoder()
        self.data['type_idx'] = self.le_type.fit_transform(self.data['contract_type'])
        
        self.scaler = StandardScaler()
        self.data['amount_scaled'] = self.scaler.fit_transform(self.data[['amount']])
        
        # Text "tokenization" (simplified hashing for demo)
        self.vocab_size = 1000
        self.data['desc_tokens'] = self.data['description'].apply(lambda x: [hash(w) % self.vocab_size for w in x.split()])
        
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        row = self.data.iloc[idx]
        return {
            'agency': torch.tensor(row['agency_idx'], dtype=torch.long),
            'vendor': torch.tensor(row['vendor_idx'], dtype=torch.long),
            'type': torch.tensor(row['type_idx'], dtype=torch.long),
            'amount': torch.tensor(row['amount_scaled'], dtype=torch.float),
            'desc': torch.tensor(row['desc_tokens'], dtype=torch.long), # Variable length... need padding in collate or fixed
            'is_anomaly': torch.tensor(row['is_anomaly'], dtype=torch.float)
        }

def collate_fn(batch):
    # Padding for text
    descs = [item['desc'] for item in batch]
    max_len = max([len(d) for d in descs])
    padded_descs = torch.zeros(len(batch), max_len, dtype=torch.long)
    for i, d in enumerate(descs):
        padded_descs[i, :len(d)] = d
        
    return {
        'agency': torch.stack([item['agency'] for item in batch]),
        'vendor': torch.stack([item['vendor'] for item in batch]),
        'type': torch.stack([item['type'] for item in batch]),
        'amount': torch.stack([item['amount'] for item in batch]).unsqueeze(1),
        'desc': padded_descs,
        'is_anomaly': torch.stack([item['is_anomaly'] for item in batch])
    }

class GPFTModel(nn.Module):
    def __init__(self, num_agencies, num_vendors, num_types, vocab_size, d_model=64):
        super().__init__()
        self.d_model = d_model
        
        # Modular Adapters (Embeddings)
        self.emb_agency = nn.Embedding(num_agencies, d_model)
        self.emb_vendor = nn.Embedding(num_vendors, d_model)
        self.emb_type = nn.Embedding(num_types, d_model)
        self.emb_amount = nn.Linear(1, d_model)
        self.emb_desc = nn.EmbeddingBag(vocab_size, d_model, mode='mean')
        
        # Transformer Encoder (Autoencoder core)
        encoder_layer = nn.TransformerEncoderLayer(d_model=d_model, nhead=4, dim_feedforward=128, batch_first=True)
        self.transformer_encoder = nn.TransformerEncoder(encoder_layer, num_layers=2)
        
        # Decoders (Reconstruction) - acting as the "Decoder" part of Autoencoder
        self.dec_agency = nn.Linear(d_model, num_agencies)
        self.dec_vendor = nn.Linear(d_model, num_vendors)
        self.dec_type = nn.Linear(d_model, num_types)
        self.dec_amount = nn.Linear(d_model, 1)
        self.dec_desc = nn.Linear(d_model, vocab_size) # Reconstruct mean embedding? Hard. 
        # Simplified: We will focus on reconstruction loss in LATENT space or simple feature reconstruction.
        # Let's try to reconstruct the embeddings themselves to keep it unified, 
        # or better: reconstruct the features.
        
    def forward(self, agency, vendor, ctype, amount, desc):
        # 1. Embed Inputs
        e_agency = self.emb_agency(agency) # (B, d)
        e_vendor = self.emb_vendor(vendor)
        e_type = self.emb_type(ctype)
        e_amount = self.emb_amount(amount)
        e_desc = self.emb_desc(desc) 
        
        # 2. Stack as Sequence
        # Sequence: [Agency, Vendor, Type, Amount, Desc]
        x = torch.stack([e_agency, e_vendor, e_type, e_amount, e_desc], dim=1) # (B, 5, d)
        
        # 3. Add Noise (Denoising Autoencoder)
        if self.training:
            x = x + torch.randn_like(x) * 0.1
            
        # 4. Transformer Encoder
        latent = self.transformer_encoder(x) # (B, 5, d)
        
        # 5. Decode / Reconstruct
        # We grab the corresponding positions
        r_agency = self.dec_agency(latent[:, 0, :])
        r_vendor = self.dec_vendor(latent[:, 1, :])
        r_type = self.dec_type(latent[:, 2, :])
        r_amount = self.dec_amount(latent[:, 3, :])
        # For text, we'll skip vocab reconstruction and just penalize embedding distance for simplicity in this demo,
        # or try to reconstruct the 'bag' (multi-label classification?). 
        # Let's use MSE on the embedding for text to save time/complexity.
        r_desc_emb = latent[:, 4, :] 
        
        return {
            'r_agency': r_agency,
            'r_vendor': r_vendor,
            'r_type': r_type,
            'r_amount': r_amount,
            'r_desc_emb': r_desc_emb,
            'orig_desc_emb': e_desc
        }
        
    def compute_loss(self, outputs, targets):
        # Reconstruction Losses
        loss_agency = F.cross_entropy(outputs['r_agency'], targets['agency'])
        loss_vendor = F.cross_entropy(outputs['r_vendor'], targets['vendor'])
        loss_type = F.cross_entropy(outputs['r_type'], targets['type'])
        loss_amount = F.mse_loss(outputs['r_amount'], targets['amount'])
        loss_desc = F.mse_loss(outputs['r_desc_emb'], outputs['orig_desc_emb'].detach()) # Proxy for text reconstruction
        
        total_loss = loss_agency + loss_vendor + loss_type + loss_amount + loss_desc
        return total_loss

