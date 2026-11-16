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
Create a `.env` file in the `server` directory based on `.env.example`:
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
3.  **Frontend Client** (Port 3039):
    ```bash
    cd client && npm run dev
    ```

Open your browser and navigate to `http://localhost:3039` to use the application.

## 📝 Usage Guide

1.  **Sign in**: Create an account, or choose "Continue as a guest" to look around. A short walkthrough opens on your first sign-in; replay it any time from "Take the tour" in the top bar.
2.  **Upload**: On "Upload & analyse", choose a JSON or CSV file. The columns are checked in the browser and any rows that will be skipped are listed before anything is saved.
    *   *Tip*: Include `estimated_cost` and `num_bidders` columns to enable cost-overrun and single-bidder checks.
3.  **Analyse**: On the same page, press "Run analysis" to score every stored transaction.
4.  **Review**: "Overview" shows the totals, "Anomalies" is the ranked queue with the reasons for each flag, "Vendors" groups flags by payee, and "Risk map" shows where they cluster.

If a page has nothing to show, it says why: the status indicator in the top bar and the checklist on the page name the missing step (server unreachable, database not connected, nothing uploaded, or analysis not run) and how to fix it.
