import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, TrendingUp, Users, MapPin, Play, Bell, ArrowRight } from 'lucide-react';
import ParticleBackground from '../../components/ParticleBackground';
import CounterAnimation from '../../components/CounterAnimation';

export default function HeroSection() {
  const [typedText, setTypedText] = useState('');
  const tagline = 'Transparent AI for Ethical Governance™';

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= tagline.length) {
        setTypedText(tagline.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 80);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: Shield, value: '4.7', suffix: 'Cr', prefix: '₹', label: 'Fraud Blocked', color: 'from-cyan-500 to-blue-500' },
    { icon: TrendingUp, value: '92', suffix: '%', prefix: '', label: 'Time Saved', color: 'from-indigo-500 to-purple-500' },
    { icon: Users, value: '15', suffix: 'K', prefix: '', label: 'Transactions', color: 'from-purple-500 to-pink-500' },
    { icon: MapPin, value: '127', suffix: '', prefix: '', label: 'Districts', color: 'from-pink-500 to-cyan-500' }
  ];

  const anomalies = [
    { vendor: 'ABC Infra Ltd', risk: 'HIGH', amount: '₹2.3Cr', reason: 'Shell company pattern' },
    { vendor: 'XYZ Suppliers', risk: 'MEDIUM', amount: '₹1.8Cr', reason: 'Repeated address clustering' }
  ];

  return (
    <section className="relative bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 px-6 py-24 lg:pl-32 lg:pr-16 min-h-screen flex items-center overflow-hidden transition-all duration-500">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Floating Gradient Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-2 lg:gap-12 flex flex-col relative z-10">
        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center"
        >
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-slate-900 dark:text-slate-50 leading-tight transition-theme duration-300"
          >
            AI-Powered Fraud Detection for Public Spending
          </motion.h1>

          {/* Animated Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-6 h-8"
          >
            <span className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 font-semibold">
              {typedText}
              <span className="animate-pulse">|</span>
            </span>
          </motion.div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 mb-8 transition-theme duration-300"
          >
            Automatically analyzes large-scale government spending and beneficiary data to detect anomalies, assign risk scores, and explain flagged items in real time. Built for auditability and transparency.
          </motion.p>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-md p-6 shadow-lg hover:shadow-2xl dark:hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col items-center text-center min-h-[180px] justify-center"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg shrink-0`}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-slate-50 transition-theme duration-300 mb-1">
                    <CounterAnimation end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                  </div>
                  <div className="text-sm font-bold text-slate-500 dark:text-slate-400 transition-theme duration-300 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="flex flex-wrap gap-6 mb-12"
          >
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white font-black px-10 py-4 rounded-2xl shadow-2xl shadow-indigo-500/20 dark:shadow-cyan-500/30 transition-all duration-300 flex items-center gap-3 text-lg"
              >
                <Play size={20} fill="currentColor" />
                Live Dashboard
              </motion.button>
            </Link>
            <a href="#how-it-works">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-10 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 backdrop-blur-sm transition-all duration-300 font-bold text-lg"
              >
                See How It Works
              </motion.button>
            </a>
          </motion.div>

          {/* Trust Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-3 transition-theme duration-300"
          >
            <Shield size={16} className="text-indigo-600 dark:text-cyan-400" />
            Built using Open Government Data and Explainable AI.
          </motion.div>
        </motion.div>

        {/* Right Column - Interactive Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center justify-center mt-12 lg:mt-0"
        >
          <div className="w-full max-w-lg space-y-6">
            {/* Risk Heatmap Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-slate-900 dark:text-slate-100 font-black text-xl tracking-tight transition-theme duration-300">Risk Heatmap</span>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>

              <div className="relative h-48 bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-6 mb-6 transition-theme duration-300 border border-slate-100 dark:border-slate-900">
                <div className="absolute top-8 left-12 w-16 h-16 bg-red-500/30 rounded-full blur-xl animate-pulse" />
                <div className="absolute top-16 right-16 w-20 h-20 bg-yellow-500/30 rounded-full blur-xl animate-pulse" />
                <div className="absolute bottom-12 left-20 w-12 h-12 bg-emerald-500/30 rounded-full blur-xl animate-pulse" />
                <div className="absolute bottom-6 right-12 w-16 h-16 bg-orange-500/30 rounded-full blur-xl animate-pulse" />
              </div>

              <div className="flex items-center justify-between text-sm font-bold text-slate-600 dark:text-slate-400 transition-theme duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>High Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Low</span>
                </div>
              </div>
            </motion.div>

            {/* Top Anomalies Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500"
            >
              <span className="text-slate-900 dark:text-slate-100 font-black text-xl mb-6 block tracking-tight transition-theme duration-300">Top Anomalies</span>
              <div className="space-y-4">
                {anomalies.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 hover:bg-indigo-50 dark:hover:bg-slate-900 transition-all duration-300 group/item border border-transparent hover:border-indigo-100 dark:hover:border-slate-800"
                  >
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-widest ${item.risk === 'HIGH' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'}`}>
                      {item.risk}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-900 dark:text-slate-100 font-black text-base truncate transition-theme duration-300">{item.vendor}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs transition-theme duration-300">{item.reason}</div>
                    </div>
                    <div className="text-slate-900 dark:text-slate-100 font-black text-base whitespace-nowrap transition-theme duration-300">{item.amount}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Live Alerts Ticker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              className="bg-indigo-600 dark:bg-cyan-500 rounded-2xl p-5 shadow-2xl overflow-hidden text-white flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center animate-pulse">
                  <Bell className="text-white" size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Live Security Feed</span>
                  <span className="text-sm font-bold truncate max-w-[200px]">Anomalous pattern detected in District 47</span>
                </div>
              </div>
              <ArrowRight size={20} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
