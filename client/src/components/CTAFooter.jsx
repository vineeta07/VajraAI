import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';

export default function CTAFooter() {
    return (
        <section className="relative bg-slate-50 dark:bg-slate-950 py-24 px-6 lg:pl-32 lg:pr-16 overflow-hidden transition-colors duration-500">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl transition-opacity animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl transition-opacity animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Icon */}
                    <div className="w-20 h-20 mx-auto mb-8 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-cyan-500 dark:to-indigo-600 flex items-center justify-center shadow-xl">
                        <Shield className="text-white" size={40} />
                    </div>

                    {/* Headline */}
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-50 mb-6 tracking-tight transition-colors">
                        Ready to Detect Fraud?
                    </h2>

                    {/* Subheadline */}
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto transition-colors">
                        Join government departments using VajraAI to protect public funds and ensure transparency.
                    </p>

                    {/* CTA Button */}
                    <Link to="/login">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white font-black text-xl shadow-2xl shadow-indigo-500/20 dark:shadow-cyan-500/30 transition-all duration-300"
                        >
                            Get Started Free
                            <ArrowRight size={24} />
                        </motion.button>
                    </Link>

                    {/* Social Proof */}
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-8 font-medium transition-colors">
                        No credit card required • Demo credentials available • Audit-ready reports
                    </p>
                </motion.div>

                {/* Footer Links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800"
                >
                    <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500 dark:text-slate-500 font-medium">
                        <a href="#" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">Documentation</a>
                        <a href="#" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">Contact</a>
                    </div>

                    <p className="text-slate-400 dark:text-slate-600 text-xs mt-6 transition-colors">
                        © 2026 VajraAI. Built with ❤️ for transparent governance.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
