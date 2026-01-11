# Deployment Guide

This guide describes how to deploy the VajraAI application.

## Prerequisites

1.  GitHub Account (with this repository pushed).
2.  [Render](https://render.com) Account.
3.  [Vercel](https://vercel.com) Account.

## Part 1: Backend & Database (Render)

We will use a Blueprint to deploy the Node.js server, PostgreSQL database, and Python ML service together.

1.  Log in to the [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Blueprint**.
3.  Connect your GitHub repository for `Hack4Delhi`.
4.  Render will automatically detect the `render.yaml` file in the root directory.
5.  Click **Apply Blueprint**.
6.  Render will:
    *   Create a PostgreSQL database (`hack4delhi-db`).
    *   Deploy the Python ML Service (`hack4delhi-ml-service`).
    *   Deploy the Backend Server (`hack4delhi-server`) and run the `db/dbSetup.js` script to initialize tables.

**Note:** The creation process might take a few minutes. Wait for all services to show as "Live" or "Available".

## Part 2: Frontend (Vercel)

1.  Log in to the [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import the `Hack4Delhi` repository.
4.  Configure the project:
    *   **Root Directory**: Click "Edit" and select `client`.
    *   **Framework Preset**: Vite.
    *   **Environment Variables**:
        *   `VITE_API_URL`: Paste the URL of your deployed Backend Server from Render (e.g., `https://hack4delhi-server.onrender.com`). *Do not include a trailing slash.*
5.  Click **Deploy**.

## Part 3: Verification

1.  Once Vercel finishes deploying, visit the provided URL.
2.  Try to **Register** a new user account.
    *   If successful, the Frontend is communicating with the Backend, and the Backend is writing to the Database.
3.  Go to **Analyze** and try to run an analysis (if you have data).
    *   This verifies the Backend is communicating with the ML Service.

## Troubleshooting

*   **Database connection errors**: Check the `DATABASE_CONNECTION_STRING` in the Render Backend service environment variables.
*   **CORS errors**: Ensure the Backend allows requests from your Vercel domain. In `server/server.js`, `app.use(cors())` is currently set to allow all origins, which is fine for a hackathon/demo but should be restricted for production.
*   **ML Service errors**: Check the logs of the `hack4delhi-ml-service` in Render.
