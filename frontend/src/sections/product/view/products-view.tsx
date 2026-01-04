import toast, { Toaster } from 'react-hot-toast';
import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Share2, FileText, Calculator, Zap, TrendingDown, ShieldAlert } from 'lucide-react';

import Container from '@mui/material/Container';

import { socket } from '../socket';
import RiskTable from './RiskTable';
import { SchemeType } from '../types';
import GraphNetwork from './GraphNetwork';

import type { SavingsState } from '../types';

type ProductsViewProps = {
  darkMode: boolean;
};

// Custom order: All first, Procurement last
const SCHEME_ORDER: SchemeType[] = [
  SchemeType.ALL,
  SchemeType.WELFARE,
  SchemeType.SPENDING,
  SchemeType.PROCUREMENT
];

export function ProductsView({ darkMode }: ProductsViewProps) {
  const isDarkMode = darkMode;
  const [activeScheme, setActiveScheme] = useState<SchemeType>(SchemeType.ALL);
  const [stats, setStats] = useState<SavingsState>({
    blocked: 47000000,
    ghosts: 247,
    firs: 350
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const listenerSetRef = useRef(false);

  useEffect(() => {
    // Only set up listeners once
    if (listenerSetRef.current) return undefined;
    listenerSetRef.current = true;

    socket.on('savings-updated', (newStats: SavingsState) => {
      setStats(newStats);
      setIsSimulating(false);
    });

    socket.on('notification', (data: { message: string; type: string }) => {
      // Show only ONE toast
      toast.dismiss();
      setTimeout(() => {
        toast.success(data.message, {
          id: 'simulation-toast', // Use a fixed ID to prevent duplicates
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#10b981',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontWeight: 600,
          },
        });
      }, 100);
    });

    return () => {
      socket.off('savings-updated');
      socket.off('notification');
      listenerSetRef.current = false;
    };
  }, []);

  const formatCurrency = (val: number) => `₹${(val / 10000000).toFixed(1)} Cr`;

  const simulateBlock = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    toast.dismiss(); // Clear ALL existing toasts
    socket.emit('simulate-block', {});
  };

  const downloadAuditReport = () => {
    toast.dismiss();
    toast.success("Downloading Audit ROI Report...", {
      id: 'download-toast',
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#6366f1',
        color: '#fff',
        borderRadius: '12px',
        padding: '16px',
        fontWeight: 600,
      },
    });
  };

  return (
    <Container maxWidth="xl" style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '32px' }}>
      <Toaster toastOptions={{ duration: 3000 }} />
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* Header with Scheme Filter on RIGHT */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ 
              fontSize: '2.25rem', 
              fontWeight: 700, 
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
            }}>
              VajraAI Investigation Portal
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Actionable ML-driven financial safeguards.
            </p>
          </div>
          
          {/* Scheme Filter - RIGHT SIDE - Custom Order: All first, Procurement last */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            padding: '6px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            {SCHEME_ORDER.map((scheme) => {
              const colors: Record<string, string> = {
                'Procurement': '#3b82f6',
                'Welfare': '#8b5cf6',
                'Spending': '#f59e0b',
                'All': '#6366f1'
              };
              const color = colors[scheme] || '#6366f1';
              const isActive = activeScheme === scheme;
              
              return (
                <button
                  key={scheme}
                  onClick={() => setActiveScheme(scheme)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: isActive ? color : 'transparent',
                    color: isActive ? '#ffffff' : '#6b7280',
                    boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {scheme}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Cards - In White Card Container */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f3f4f6',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { label: 'BLOCKED REVENUE', value: formatCurrency(stats.blocked), icon: TrendingDown, bgColor: '#059669' },
              { label: 'GHOSTS PURGED', value: stats.ghosts.toString(), icon: ShieldAlert, bgColor: '#dc2626' },
              { label: 'ACTIVE FIRS', value: stats.firs.toString(), icon: ShieldAlert, bgColor: '#9333ea' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: item.bgColor,
                  padding: '24px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                }}
              >
                <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '12px' }}>
                  <item.icon style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div>
                  <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600, marginBottom: '8px' }}>
                    {item.label}
                  </p>
                  <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', margin: 0 }}>{item.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '24px' }}>
            <button 
              onClick={simulateBlock}
              disabled={isSimulating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: isSimulating ? '#a5b4fc' : '#6366f1',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '24px',
                border: 'none',
                cursor: isSimulating ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              <Zap style={{ width: '16px', height: '16px', color: '#fbbf24' }} />
              {isSimulating ? 'Simulating...' : 'Trigger Block Simulation'}
            </button>
            <button 
              onClick={downloadAuditReport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '24px',
                border: '1px solid #e5e7eb',
                cursor: 'pointer'
              }}
            >
              <FileText style={{ width: '16px', height: '16px' }} />
              Audit ROI Report
            </button>
          </div>
        </div>

        {/* Risk Table Card */}
        <div style={{ marginBottom: '32px' }}>
          <Suspense fallback={<div style={{ height: '400px', backgroundColor: 'white', borderRadius: '24px' }} />}>
            <RiskTable filterScheme={activeScheme} isDarkMode={isDarkMode} />
          </Suspense>
        </div>

        {/* Network Graph (BIGGER) + Summary/ROI (SMALLER) */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' }}>
          
          {/* Collusion Network Card - MORE SHADOW */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #f3f4f6',
            overflow: 'hidden',
            height: '520px'
          }}>
            <Suspense fallback={<div style={{ height: '100%', backgroundColor: '#f3f4f6' }} />}>
              <GraphNetwork isDarkMode={isDarkMode} />
            </Suspense>
          </div>
          
          {/* Summary + ROI Calculator Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #f3f4f6',
            overflow: 'hidden',
            height: '520px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Network Summary Section */}
            <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ padding: '8px', backgroundColor: '#eef2ff', borderRadius: '8px' }}>
                  <Share2 style={{ width: '18px', height: '18px', color: '#6366f1' }} />
                </div>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  Network Risk Summary
                </h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Node Connectivity</span>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: '#6366f1' }}>88.4%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Cross-District Links</span>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: '#f97316' }}>1,242</span>
                </div>
              </div>
            </div>

            {/* ROI Calculator Section */}
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ padding: '8px', backgroundColor: '#ecfdf5', borderRadius: '8px' }}>
                  <Calculator style={{ width: '18px', height: '18px', color: '#10b981' }} />
                </div>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  ROI Calculator
                </h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <div style={{ backgroundColor: '#f9fafb', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Total Blocked</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>{formatCurrency(stats.blocked)}</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '78%', background: 'linear-gradient(90deg, #34d399, #10b981)', borderRadius: '999px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ backgroundColor: '#eff6ff', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#3b82f6', textTransform: 'uppercase', marginBottom: '2px' }}>Implementation Cost</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#1d4ed8' }}>₹45L</div>
                  </div>
                  <div style={{ backgroundColor: '#faf5ff', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#8b5cf6', textTransform: 'uppercase', marginBottom: '2px' }}>ROI Multiplier</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#7c3aed' }}>104x</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Annual Savings</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>₹18.2 Cr</span>
                </div>
              </div>

              <button 
                onClick={downloadAuditReport}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '13px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)'
                }}
              >
                <FileText style={{ width: '14px', height: '14px' }} />
                Generate Full Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}