import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, Users, ShieldAlert, FileDown, Zap } from 'lucide-react';

import { socket } from '../socket';

import type { SavingsState } from '../types';

// Add isDarkMode prop
interface SavingsTrackerProps {
  isDarkMode?: boolean;
}

const SavingsTracker: React.FC<SavingsTrackerProps> = ({ isDarkMode }) => {
  const [stats, setStats] = useState<SavingsState>({
    blocked: 47000000,
    ghosts: 247,
    firs: 350
  });

  useEffect(() => {
    socket.on('savings-updated', (newStats: SavingsState) => {
      setStats(newStats);
    });
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 1
    }).format(val / 10000000) + ' Cr';

  const simulateBlock = () => {
    socket.emit('simulate-block', {});
    toast.success("Simulating PFMS Webhook Block...", {
      position: 'top-right',
      duration: 3000,
      style: {
        background: '#10b981',
        color: '#fff',
        borderRadius: '12px',
        padding: '16px',
        fontWeight: 600,
      },
    });
  };

  const downloadAuditReport = () => {
    toast.success("Downloading Audit ROI Report...", {
      position: 'top-right',
      duration: 3000,
      style: {
        background: '#6366f1',
        color: '#fff',
        borderRadius: '12px',
        padding: '16px',
        fontWeight: 600,
      },
    });
  };

  const trackerItems = [
    { label: 'Blocked Revenue', value: formatCurrency(stats.blocked), icon: TrendingDown, color: '#10b981', bgColor: '#059669' },
    { label: 'Ghosts Purged', value: stats.ghosts.toString(), icon: Users, color: '#ef4444', bgColor: '#dc2626' },
    { label: 'Active FIRs', value: stats.firs.toString(), icon: ShieldAlert, color: '#a855f7', bgColor: '#9333ea' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {trackerItems.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4, scale: 1.02 }}
            style={{
              backgroundColor: item.bgColor,
              padding: '1.5rem',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              transition: 'all 0.3s',
            }}
          >
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem' }}>
            <item.icon style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600, marginBottom: '0.5rem' }}>{item.label}</p>
            <h3 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'white' }}>{item.value}</h3>
          </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={simulateBlock}
          className="flex items-center gap-2 px-6 py-3 text-white text-sm font-bold shadow-lg transition-all"
          style={{ backgroundColor: '#6366f1', borderRadius: '24px' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
        >
          <Zap className="w-4 h-4" style={{ color: '#fbbf24' }} />
          Trigger Block Simulation
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={downloadAuditReport}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-600 text-sm font-bold transition-all shadow-sm"
          style={{ borderRadius: '24px' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#6366f1';
            e.currentTarget.style.color = '#6366f1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.color = '#4b5563';
          }}
        >
          <FileDown className="w-4 h-4" />
          Audit ROI Report
        </motion.button>
      </div>
    </div>
  );
};

export default SavingsTracker;
