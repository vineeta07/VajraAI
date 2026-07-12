import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Map, Bell, FileText, CheckCircle, Languages } from 'lucide-react';

const features = [
    {
        icon: Shield,
        title: 'AI Anomaly Detection',
        description: 'Surfaces suspicious records using Isolation Forest and rule-based checks—no labeled data required.',
        color: 'from-cyan-500 to-blue-500'
    },
    {
        icon: Map,
        title: 'Interactive Heatmap',
        description: 'Visualize fraud risk across districts and schemes with color-coded geographic insights.',
        color: 'from-indigo-500 to-purple-500'
    },
    {
        icon: Bell,
        title: 'Real-time Alerts',
        description: 'Get instant notifications for high-risk transactions and suspicious patterns.',
        color: 'from-cyan-500 to-teal-500'
    },
    {
        icon: FileText,
        title: 'Explainable Results',
        description: 'Every flagged transaction includes human-readable reasons and risk scores.',
        color: 'from-blue-500 to-indigo-500'
    },
    {
        icon: CheckCircle,
        title: 'Audit-Ready Reports',
        description: 'Export detailed logs and reports designed for auditors and vigilance teams.',
        color: 'from-teal-500 to-cyan-500'
    },
    {
        icon: Languages,
        title: 'Multi-language Support',
        description: 'Interface available in English and Hindi for wider accessibility.',
        color: 'from-purple-500 to-pink-500'
    }
];

export default function Features() {
    return (
        <section className="bg-white dark:bg-slate-950 py-24 px-6 lg:pl-32 lg:pr-16 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4 transition-colors">
                        Powerful Features for Fraud Detection
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto transition-colors">
                        Built with cutting-edge AI and designed for government auditors and policy makers
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm p-8 shadow-md hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col h-full min-h-[300px]"
                            >
                                {/* Gradient Background on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Content */}
                                <div className="relative z-10 flex flex-col h-full">
                                    {/* Icon */}
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/10 shrink-0`}>
                                        <Icon className="text-white" size={28} />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                        {feature.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed grow">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
