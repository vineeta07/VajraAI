import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, Lock, FileText, AlertTriangle, CheckCircle, Search, Filter } from 'lucide-react';
import Container from '@mui/material/Container';
import { useTheme } from '../hooks/useTheme';

const MOCK_REPORTS = [
    { id: 'T-8521', subject: 'Anomalous procurement in Health Dept', department: 'Public Health', date: '2026-01-10', status: 'NEW', priority: 'HIGH', desc: 'Suspected collusion between three vendors for hospital supply contracts worth ₹4.5Cr.' },
    { id: 'T-8432', subject: 'Ghost beneficiaries in Housing Scheme', department: 'Rural Development', date: '2026-01-08', status: 'INVESTIGATING', priority: 'CRITICAL', desc: 'Over 200 duplicate PAN IDs found in the PM-AWAS list in Purulia district.' },
    { id: 'T-8311', subject: 'Inconsistent billing for road construction', department: 'PWD', date: '2026-01-05', status: 'REJECTED', priority: 'LOW', desc: 'Minor discrepancy in invoice formatting, likely a clerical error.' },
];

export default function WhistleblowerReportsPage() {
    const { isDark } = useTheme();
    const [selectedReport, setSelectedReport] = useState(null);

    return (
        <Container maxWidth="xl" className="py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 transition-theme">Anonymous Tips Monitor</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium transition-theme">Encryption-secured reports from the public portal.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 transition-theme dark:text-white"
                        />
                    </div>
                    <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-theme">
                        <Filter className="text-slate-600 dark:text-slate-400" size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Reports List */}
                <div className="lg:col-span-2 space-y-4">
                    {MOCK_REPORTS.map((report) => (
                        <motion.div
                            key={report.id}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => setSelectedReport(report)}
                            className={`p-6 rounded-2xl border cursor-pointer transition-all ${selectedReport?.id === report.id
                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/40 shadow-lg'
                                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${report.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                                            report.priority === 'HIGH' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {report.priority}
                                    </div>
                                    <span className="text-xs font-mono text-slate-400">{report.id}</span>
                                </div>
                                <span className="text-xs text-slate-500">{report.date}</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 transition-theme">{report.subject}</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                    <Shield size={14} />
                                    {report.department}
                                </div>
                                <div className={`text-xs font-bold ${report.status === 'NEW' ? 'text-indigo-600 dark:text-indigo-400' :
                                        report.status === 'INVESTIGATING' ? 'text-amber-600' : 'text-slate-400'
                                    }`}>
                                    ● {report.status}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Selected Report Detail */}
                <div className="lg:col-span-1">
                    <AnimatePresence mode="wait">
                        {selectedReport ? (
                            <motion.div
                                key={selectedReport.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl transition-theme sticky top-24"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                                        <FileText className="text-indigo-600 dark:text-indigo-400" size={24} />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white transition-theme">Report Details</h2>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Subject</label>
                                        <p className="text-slate-900 dark:text-slate-200 font-bold leading-snug">{selectedReport.subject}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Full Description</label>
                                        <p className="text-slate-700 dark:text-slate-400 text-sm leading-relaxed">{selectedReport.desc}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Source</label>
                                            <p className="text-slate-900 dark:text-slate-200 text-xs font-bold flex items-center gap-1">
                                                <Lock size={12} className="text-green-500" /> Encrypted-Anon
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Integrity Score</label>
                                            <p className="text-indigo-600 font-bold text-xs font-mono">92/100</p>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                        <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                                            <CheckCircle size={18} /> Open Investigation
                                        </button>
                                        <button className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                                            <AlertTriangle size={18} /> Mark as False Tip
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 transition-theme">
                                <Eye className="text-slate-300 dark:text-slate-700 mx-auto mb-4" size={48} />
                                <p className="text-slate-500 dark:text-slate-600 font-medium">Select a report to view details and start investigation.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Container>
    );
}
