import torch
from torch.utils.data import DataLoader, random_split
from model import FraudDataset, collate_fn, GPFTModel
import torch.optim as optim
import os

def train():
    # Configuration
    BATCH_SIZE = 32
    EPOCHS = 5
    LR = 1e-3
    DATA_PATH = "public_sector_data.csv"
    ARTIFACT_DIR = "/Users/aadvikchaturvedi/.gemini/antigravity/brain/0d0f13a6-4fd9-4456-8990-5b96a882564a"
    MODEL_PATH = os.path.join(ARTIFACT_DIR, "gpft_model.pth")
    LOG_PATH = os.path.join(ARTIFACT_DIR, "training_log.txt")

    print("Loading Dataset...")
    dataset = FraudDataset(DATA_PATH)
    
    # Split
    train_size = int(0.8 * len(dataset))
    test_size = len(dataset) - train_size
    train_dataset, test_dataset = random_split(dataset, [train_size, test_size])
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, collate_fn=collate_fn)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, collate_fn=collate_fn)
    
    # Model Init
    num_agencies = len(dataset.le_agency.classes_)
    num_vendors = len(dataset.le_vendor.classes_)
    num_types = len(dataset.le_type.classes_)
    vocab_size = dataset.vocab_size
    
    model = GPFTModel(num_agencies, num_vendors, num_types, vocab_size)
    optimizer = optim.Adam(model.parameters(), lr=LR)
    
    print("Starting Training...")
    with open(LOG_PATH, "w") as f:
        f.write("Epoch,Train_Loss\n")
        
    for epoch in range(EPOCHS):
        model.train()
        total_loss = 0
        for batch in train_loader:
            optimizer.zero_grad()
            
            outputs = model(
                batch['agency'],
                batch['vendor'],
                batch['type'],
                batch['amount'],
                batch['desc']
            )
            
            loss = model.compute_loss(outputs, batch)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
            
        avg_loss = total_loss / len(train_loader)
        print(f"Epoch {epoch+1}/{EPOCHS}, Loss: {avg_loss:.4f}")
        
        with open(LOG_PATH, "a") as f:
            f.write(f"{epoch+1},{avg_loss:.4f}\n")
            
    # Save Model
    torch.save(model.state_dict(), MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

    # Save Preprocessors
    import pickle
    preprocessors = {
        'le_agency': dataset.le_agency,
        'le_vendor': dataset.le_vendor,
        'le_type': dataset.le_type,
        'scaler': dataset.scaler,
        'vocab_size': dataset.vocab_size # Save vocab size too
    }
    with open(os.path.join(ARTIFACT_DIR, "preprocessors.pkl"), "wb") as f:
        pickle.dump(preprocessors, f)
    print("Preprocessors saved.")
    
    # Verification/Eval on Test
    model.eval()
    test_loss = 0
    with torch.no_grad():
        for batch in test_loader:
            outputs = model(
                batch['agency'],
                batch['vendor'],
                batch['type'],
                batch['amount'],
                batch['desc']
            )
            loss = model.compute_loss(outputs, batch)
            test_loss += loss.item()
    
    print(f"Test Loss: {test_loss / len(test_loader):.4f}")

if __name__ == "__main__":
    train()
