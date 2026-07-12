import React from 'react';
import { motion } from 'framer-motion';
import { Award, Building2, Globe2, TrendingUp } from 'lucide-react';
import CounterAnimation from './CounterAnimation';

const trustLogos = [
    { name: 'CAG', icon: Award },
    { name: 'RBI', icon: Building2 },
    { name: 'World Bank', icon: Globe2 }
];

const impactStats = [
    { value: '98.7', suffix: '%', label: 'Detection Accuracy', icon: TrendingUp },
    { value: '247', suffix: '', label: 'Active Alerts', icon: Award },
];

export default function TrustSection() {
    return (
        <section className="bg-slate-50 dark:bg-slate-950 py-24 px-6 lg:pl-32 lg:pr-16 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4 transition-colors">
                        Trusted by Government Bodies
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto transition-colors">
                        Built with transparency and compliance at its core
                    </p>
                </motion.div>

                {/* Trust Logos */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-wrap items-center justify-center gap-8 mb-16"
                >
                    {trustLogos.map((logo, index) => {
                        const Icon = logo.icon;
                        return (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.1 }}
                                className="flex flex-col items-center gap-2 p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 transition-all duration-300"
                            >
                                <Icon className="text-indigo-600 dark:text-cyan-400" size={32} />
                                <span className="text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors">{logo.name}</span>
                            </motion.div>
                        );
                    })}

                    {/* Audit-Ready Badge */}
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex flex-col items-center gap-2 p-6 rounded-xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 dark:from-cyan-500/10 dark:to-indigo-500/10 backdrop-blur-sm border border-indigo-200 dark:border-cyan-500/50 hover:border-cyan-400 transition-all duration-300"
                    >
                        <Award className="text-indigo-600 dark:text-cyan-400" size={32} />
                        <span className="text-indigo-600 dark:text-cyan-400 font-bold text-sm transition-colors">Audit-Ready</span>
                    </motion.div>
                </motion.div>

                {/* Impact Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {impactStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm p-10 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 overflow-hidden min-h-[160px] group flex items-center"
                            >
                                {/* Background Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                                {/* Content */}
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-cyan-500 dark:to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <Icon className="text-white" size={32} />
                                    </div>

                                    <div>
                                        <div className="text-4xl font-black text-slate-900 dark:text-slate-50 mb-1 tracking-tight transition-colors">
                                            <CounterAnimation end={stat.value} suffix={stat.suffix} />
                                        </div>
                                        <div className="text-base text-slate-600 dark:text-slate-400 font-medium transition-colors">{stat.label}</div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
