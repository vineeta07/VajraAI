import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { ShieldCheck, ArrowRight, UploadCloud, Activity, BarChart3 } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>VajraAI - Fraud Detection</title>
      </Helmet>

      <div className="min-h-screen flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
        
        {/* Simple Header */}
        <header className="flex items-center justify-between p-2 max-w-7xl mx-auto w-full">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="VajraAI Logo" className="w-14 h-14 object-contain" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-600">
              VajraAI
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button 
              onClick={() => navigate('/sign-in')}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors border border-slate-300 dark:border-slate-700"
            >
              Login
            </button>
          </div>
        </header>

        {/* Hero Content */}
        <main className="flex flex-col items-center text-center max-w-4xl mx-auto w-full">
          
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 leading-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
            AI-Powered Public Fund <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
              Integrity Monitoring
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-6 max-w-2xl">
            Detect anomalies, track vendor risks, and ensure complete transparency in government spending with real-time explainable AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2 px-8 py-4 text-base font-medium bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] hover:-translate-y-1"
            >
              Access Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Guide Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full text-left mt-2 pt-8">
             <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">1. Upload Data</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Securely upload your transaction CSV files containing vendor payments and invoice details into the system.</p>
             </div>
             <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">2. Run Analysis</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Trigger the Transformer ML models to scan every record for overspending, bid-rigging, and anomalies.</p>
             </div>
             <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">3. Review Insights</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Navigate to the Investigation Portal and Heatmap to visually drill down into flagged geographical risks.</p>
             </div>
          </div>
        </main>

        <footer className="p-6 text-center text-sm text-slate-500 dark:text-slate-500">
          &copy; {new Date().getFullYear()} VajraAI. All rights reserved.
        </footer>
      </div>
    </>
  );
}