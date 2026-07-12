import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Send, Lock, UserX, AlertCircle, CheckCircle2 } from 'lucide-react';
import Container from '@mui/material/Container';
import { useTheme } from '../hooks/useTheme';

export default function WhistleblowerPage() {
    const { isDark } = useTheme();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        department: '',
        description: '',
        evidence: null
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 1500);
    };

    if (submitted) {
        return (
            <Container maxWidth="md" className="py-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center shadow-2xl border border-slate-100 dark:border-slate-800"
                >
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="text-green-600 dark:text-green-400" size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 transition-theme">Report Submitted Securely</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed transition-theme">
                        Your anonymous tip has been encrypted and sent directly to the integrity officials.
                        Thank you for helping us maintain public transparency.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="px-8 py-3 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-xl hover:opacity-90 transition-all"
                    >
                        Submit Another Tip
                    </button>
                </motion.div>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" className="py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Side: Info */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight transition-theme">
                        Anonymous <span className="text-indigo-600 dark:text-cyan-400">Whistleblower</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed transition-theme">
                        Submit tips about financial irregularities or fraud without compromising your identity.
                        Our system uses end-to-end encryption to protect you.
                    </p>

                    <div className="space-y-6">
                        <FeatureItem
                            icon={Lock}
                            title="100% Anonymous"
                            desc="We do not track IP addresses or personal identifiers."
                            isDark={isDark}
                        />
                        <FeatureItem
                            icon={Shield}
                            title="Military-Grade Encryption"
                            desc="Your data is encrypted before it leaves your browser."
                            isDark={isDark}
                        />
                        <FeatureItem
                            icon={UserX}
                            title="Identity Protection"
                            desc="Tips are routed through secure, non-traceable channels."
                            isDark={isDark}
                        />
                    </div>

                    <div className="mt-12 p-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl flex items-start gap-4">
                        <AlertCircle className="text-amber-600 dark:text-amber-400 shrink-0" size={24} />
                        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                            Important: Please provide as much specific detail as possible (dates, amounts, departments) to help officials investigate effectively.
                        </p>
                    </div>
                </motion.div>

                {/* Right Side: Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-8 lg:p-10 shadow-xl border border-slate-100 dark:border-slate-800 transition-theme"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Subject of Concern</label>
                            <input
                                type="text"
                                placeholder="e.g., Anomalous procurement in District X"
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-theme dark:text-white"
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Department/Organization</label>
                            <input
                                type="text"
                                placeholder="Which body is involved?"
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-theme dark:text-white"
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Details of Event</label>
                            <textarea
                                rows={6}
                                placeholder="Describe the suspicion in detail..."
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-theme dark:text-white resize-none"
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                        >
                            {loading ? 'Encrypting & Sending...' : (
                                <>
                                    <Send size={20} />
                                    Submit Anonymous Tip
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </Container>
    );
}

function FeatureItem({ icon: Icon, title, desc, isDark }) {
    return (
        <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 transition-theme">
                <Icon className="text-indigo-600 dark:text-cyan-400" size={24} />
            </div>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white transition-theme">{title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 transition-theme">{desc}</p>
            </div>
        </div>
    );
}
