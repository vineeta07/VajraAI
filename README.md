# VajraAI - AI-Powered Public Spending Anomaly Detection

VajraAI is an advanced detection platform designed to identify fraud, irregularities, and anomalies in government spending, procurement, welfare delivery, and public contracts. The system combines domain-aware feature engineering, unsupervised models (e.g., Transformer autoencoders), graph/network analysis for collusion and bid-rigging detection, and a rules engine with human-in-the-loop workflows for prioritization and investigation. Emphasis is placed on explainability, data enrichment, operational monitoring, and secure handling of sensitive data. The implementation uses a modern stack with a React frontend, Node.js/Express backend, and a Python-based ML service.

## 🚀 Features

*   **Dashboard**: Real-time overview of risk distribution, recent anomalies, and top high-risk vendors.
*   **Anomaly Detection**: Advanced ML models (Transformer Autoencoder) to detect outlier transactions.
*   **Procurement Fraud Analysis**: Specialized logic to detect cost overruns ("Cost Variance") and bid rigging ("Competition Risk").
*   **Vendor Profiling**: Detailed repository of all vendors with transaction history and risk scores.
*   **Geospatial Tracking**: Interactive map visualizing risk hotspots across different locations.
*   **CSV/JSON Upload**: Bulk upload capability for transaction data.

## 🛠️ Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS, Recharts, Leaflet
*   **Backend**: Node.js, Express, PostgreSQL
*   **ML Service**: Python, FastAPI, PyTorch, Scikit-learn
*   **Database**: PostgreSQL

## 📋 Prerequisites

Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v16+)
*   [Python](https://www.python.org/) (v3.9+)
*   [PostgreSQL](https://www.postgresql.org/)

## ⚙️ Installation & Setup

### 1. Database Setup
1.  Create a PostgreSQL database (e.g., `hack4delhi`).
2.  Make sure you have the connection string ready.

### 2. Backend (Server) Setup
Navigate to the server directory:
```bash
cd server
```
Install dependencies:
```bash
npm install
```
Create a `.env` file in the `server` directory based on `.env.sample`:
```env
PORT=3000
DB_CONNECTION_STRING=postgresql://username:password@localhost:5432/hack4delhi
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=24h
ML_SERVICE_URL=http://localhost:8000/detect
```
Run the database setup script (creates tables):
```bash
node db/dbSetup.js
```
Start the server:
```bash
npm run dev
```

### 3. ML Service Setup
Navigate to the ML service directory:
```bash
cd ml-service
```
(Optional but recommended) Create and activate a virtual environment:
```bash
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```
Install Python dependencies:
```bash
pip install -r requirements.txt
```
Start the ML Service:
```bash
python -m uvicorn ml_transformer_service:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Frontend (Client) Setup
Navigate to the client directory:
```bash
cd client
```
Install dependencies:
```bash
npm install
```
Start the React application:
```bash
npm run dev
```

## 🏃‍♂️ Running the Project

To run the full application, you need to have three separate terminals open running the following services simultaneously:

1.  **ML Service** (Port 8000):
    ```bash
    cd ml-service && uvicorn ml_transformer_service:app --reload --port 8000
    ```
2.  **Backend Server** (Port 3000):
    ```bash
    cd server && npm run dev
    ```
3.  **Frontend Client** (Port 5173):
    ```bash
    cd client && npm run dev
    ```

Open your browser and navigate to `http://localhost:5173` to use the application.

## 📝 Usage Guide

1.  **Login/Register**: Create an account to access the dashboard.
2.  **Upload Data**: Go to the "Upload" page. You can upload JSON or CSV files containing transaction data.
    *   *Tip*: Include `estimated_cost` and `num_bidders` columns in your CSV to enable advanced procurement fraud detection.
3.  **Analyze**: Go to the "Analyze" page and click "Start Analysis" to run the ML model on the uploaded data.
4.  **View Results**: Check the Dashboard for high-level stats, investigate the "Anomalies" list for specific red flags, or browse "Vendors" to see risk profiles.
