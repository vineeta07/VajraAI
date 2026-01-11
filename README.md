# VajraAI - Financial Fraud Detection System

VajraAI is a comprehensive solution designed to detect and visualize anomalies in financial transaction data. It combines a robust Node.js backend, a Python-based ML service for anomaly detection, and a modern React frontend for data visualization and interaction.

## 🚀 Features

-   **Automated Anomaly Detection**: Upload transaction data and automatically screen for potential fraud using Machine Learning algorithms.
-   **Interactive Dashboard**: View key metrics, risk distributions, and top suspicious vendors at a glance.
-   **Geospatial Visualization**: Visualise risk hotspots on an interactive map.
-   **Detailed Analysis**: Inspect individual transactions with risk scores and AI-generated reasoning.
-   **Secure Authentication**: Role-based access control for secure data handling.

## 🛠️ Tech Stack

### Frontend
-   **React** (Vite)
-   **Tailwind CSS** (Styling)
-   **Recharts** (Data Visualization)
-   **Leaflet / React-Leaflet** (Maps)
-   **Axios** (API Client)

### Backend
-   **Node.js & Express**
-   **PostgreSQL** (Database)
-   **JWT** (Authentication)

### Machine Learning
-   **Python**
-   **Scikit-learn / Isolation Forest** (Anomaly Detection)

## 📂 Project Structure

```
Hack4Delhi/
├── client/          # React Frontend
├── server/          # Node.js Backend API
├── ml-service/      # Python ML scripts
└── README.md        # Project Documentation
```

## 🏁 Getting Started

### Prerequisites
-   Node.js (v16+)
-   PostgreSQL
-   Python (v3.8+)

### 1. Database Setup
Ensure PostgreSQL is running and create a database (e.g., `vajra_ai`).
Import the necessary schema (users, transactions, anomaly_results tables).

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```
Create a `.env` file in `server/` based on `.env.sample` and configure your DB credentials and JWT secret.
Start the server:
```bash
npm start
```
The server runs on `http://localhost:3000`.

### 3. Frontend Setup
Navigate to the client directory and install dependencies:
```bash
cd client
npm install
```
Start the development server:
```bash
npm run dev
```
Access the application at `http://localhost:5173`.

## 🧪 Usage Workflow

1.  **Register/Login**: Create an account to access the dashboard.
2.  **Upload Data**: Use the **Upload** page to submit a JSON file of transactions (see `client/test_transactions.json` for format).
3.  **Run Analysis**: Go to the **Analyze** page and click "Run Analysis" to trigger the ML model.
4.  **Investigate**:
    -   Check the **Dashboard** for high-level stats.
    -   View the **Anomalies** list for specific flagged items.
    -   Explore the **Heatmap** to see risks by location and department.

## 👥 Authors
-   Built for Hack4Delhi
