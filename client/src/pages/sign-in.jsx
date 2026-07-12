import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { User, Phone, Mail, Lock, AlertCircle, Loader2, Building2, ArrowRight } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function SignInPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      // Demo validation - accept any input for demo
      if (formData.phone && formData.password) {
        login({ token: 'demo-token', user: { ...formData } });
        navigate('/dashboard');
      } else {
        setError('Please fill in all required fields');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - VajraAI</title>
        <meta name="description" content="Create your VajraAI account for fraud detection" />
      </Helmet>

      <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-slate-950 transition-colors duration-500 overflow-y-auto lg:overflow-hidden">
        {/* ThemeToggle */}
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        {/* Left Side - Fullscreen Branding */}
        <div className="relative flex-1 hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-cyan-600 via-cyan-700 to-indigo-900 dark:from-slate-900 dark:via-cyan-950 dark:to-slate-950 overflow-hidden transition-colors duration-500">
          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-300/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center max-w-lg"
          >
            {/* Massive Logo */}
            <motion.div
              initial={{ scale: 0.8, rotate: 10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12 }}
              className="w-40 h-40 bg-white/10 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center mb-10 mx-auto border border-white/20 shadow-2xl"
            >
              <span className="text-white font-black text-8xl drop-shadow-2xl">V</span>
            </motion.div>

            <h1 className="text-6xl font-black text-white mb-6 tracking-tight">VajraAI</h1>
            <p className="text-2xl text-cyan-50/80 mb-12 font-medium leading-relaxed">
              Empowering government integrity with explainable artificial intelligence.
            </p>

            <div className="flex flex-col items-start space-y-6 text-cyan-100/60 text-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span>Automated anomaly score assignment</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span>Strategic district risk heatmapping</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span>Human-in-the-loop verification</span>
              </div>
            </div>
          </motion.div>
          {/* Decorative line */}
          <div className="absolute bottom-12 left-12 right-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Right Side - Fullscreen Sign Up Form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-white dark:bg-slate-950 transition-colors duration-500 relative min-h-screen lg:min-h-0 lg:h-full lg:overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md my-auto"
          >
            {/* Mobile/Tablet Logo Only */}
            <div className="lg:hidden flex flex-col items-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-3 shadow-xl">
                <span className="text-white font-black text-2xl">V</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">VajraAI</h2>
            </div>

            <div className="mb-8 text-center sm:text-left">
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Join the network</h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg">Create an organization account for deployment.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 dark:text-slate-200 text-xs font-black mb-2 uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      name="name"
                      placeholder="Admin Name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-800 dark:text-slate-200 text-xs font-black mb-2 uppercase tracking-widest">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      name="phone"
                      placeholder="+91..."
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-200 text-xs font-black mb-2 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    placeholder="gov@dept.in"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-200 text-xs font-black mb-2 uppercase tracking-widest">Organization / Dept</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="organization"
                    placeholder="Department Name"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-200 text-xs font-black mb-2 uppercase tracking-widest">Master Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl"
                >
                  <p className="text-red-700 dark:text-red-300 text-sm font-bold flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                  </p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-700 text-white font-black py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20 dark:shadow-cyan-500/40 text-lg group"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    Provisioning account...
                  </>
                ) : (
                  <>
                    Register for Access
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-900 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                Already an authorized user?{' '}
                <a href="/login" className="text-cyan-600 dark:text-cyan-400 font-black hover:underline transition-colors focus:outline-none">
                  Security Login
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
