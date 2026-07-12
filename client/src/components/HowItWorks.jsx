import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Brain, BarChart3, Layout, Download, ArrowRight } from 'lucide-react';

const steps = [
    {
        icon: Upload,
        title: 'Upload Data',
        description: 'Import government spending and beneficiary data in CSV or Excel format',
        color: 'from-cyan-500 to-blue-500'
    },
    {
        icon: Brain,
        title: 'AI Analysis',
        description: 'Isolation Forest and rule-based algorithms detect anomalies automatically',
        color: 'from-blue-500 to-indigo-500'
    },
    {
        icon: BarChart3,
        title: 'Risk Scores',
        description: 'Each transaction receives a risk score with explainable reasons',
        color: 'from-indigo-500 to-purple-500'
    },
    {
        icon: Layout,
        title: 'Dashboard',
        description: 'Interactive visualizations, heatmaps, and prioritized alerts',
        color: 'from-purple-500 to-pink-500'
    },
    {
        icon: Download,
        title: 'Export Reports',
        description: 'Generate audit-ready reports and logs for compliance',
        color: 'from-pink-500 to-cyan-500'
    }
];

export default function HowItWorks() {
    return (
        <section className="bg-white dark:bg-slate-950 py-24 px-6 lg:pl-32 lg:pr-16 relative overflow-hidden transition-colors duration-300">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 opacity-50 transition-colors" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4 transition-colors">
                        How It Works
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto transition-colors">
                        From data upload to actionable insights in 5 simple steps
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="relative">
                    {/* Desktop: Horizontal Flow */}
                    <div className="hidden lg:flex items-start justify-between gap-4">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <React.Fragment key={index}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.15 }}
                                        className="flex-1 group min-h-[280px]"
                                    >
                                        <div className="relative">
                                            {/* Icon Circle */}
                                            <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                                                <Icon className="text-white" size={32} />
                                            </div>

                                            {/* Step Number */}
                                            <div className="absolute -top-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 border-2 border-cyan-500 rounded-full flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-base transition-colors">
                                                {index + 1}
                                            </div>

                                            {/* Content */}
                                            <div className="text-center">
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3 transition-colors">
                                                    {step.title}
                                                </h3>
                                                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Arrow Connector */}
                                    {index < steps.length - 1 && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: index * 0.15 + 0.2 }}
                                            className="flex items-center pt-10"
                                        >
                                            <ArrowRight className="text-cyan-500" size={28} />
                                        </motion.div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Mobile/Tablet: Vertical Flow */}
                    <div className="lg:hidden space-y-12">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="flex items-start gap-6 group"
                                >
                                    {/* Icon Circle */}
                                    <div className="relative flex-shrink-0">
                                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                                            <Icon className="text-white" size={28} />
                                        </div>

                                        {/* Step Number */}
                                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-white dark:bg-slate-800 border-2 border-cyan-500 rounded-full flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-sm transition-colors">
                                            {index + 1}
                                        </div>

                                        {/* Vertical Line Connector */}
                                        {index < steps.length - 1 && (
                                            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gradient-to-b from-cyan-500 to-transparent" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pt-2">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2 transition-colors">
                                            {step.title}
                                        </h3>
                                        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
