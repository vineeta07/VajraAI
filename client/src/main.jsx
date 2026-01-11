import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import axios from 'axios';

// Set base URL for axios to point to the backend
// In development, vite proxy might handle this, but for production (Vercel), we need the absolute URL
// or if we serve static files from backend.
// Here we assume Vercel frontend + Render backend
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
