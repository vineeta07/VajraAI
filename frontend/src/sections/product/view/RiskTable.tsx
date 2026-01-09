import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, Check, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

import { useRisks, useUpdateRiskStatus } from '../useRisks';
import { RiskAnomaly, RiskStatus, SchemeType } from '../types';

interface RiskTableProps {
  filterScheme: SchemeType;
  isDarkMode?: boolean;
}

type SortKey = 'tenderId' | 'score' | 'amount';

const RiskTable: React.FC<RiskTableProps> = ({ filterScheme, isDarkMode }) => {
  const { data: risks, isLoading } = useRisks();
  const updateStatus = useUpdateRiskStatus();
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [riskStatuses, setRiskStatuses] = useState<Record<string, 'INVESTIGATE' | 'BLOCKED' | 'APPROVED'>>({});

  if (isLoading) {
    return (
      <div style={{
        width: '100%',
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #f3f4f6',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid #e5e7eb',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}/>
      </div>
    );
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const filteredRisks = (risks || [])
    .filter(r => filterScheme === SchemeType.ALL || r.scheme === filterScheme)
    .sort((a, b) => {
      const valA: any = a[sortKey as keyof RiskAnomaly] || 0;
      const valB: any = b[sortKey as keyof RiskAnomaly] || 0;
      if (sortOrder === 'desc') return valB > valA ? 1 : -1;
      return valA > valB ? 1 : -1;
    })
    .slice(0, 10);

  const SortIcon = ({ colKey }: { colKey: SortKey }) => {
    if (sortKey !== colKey) return <ArrowUpDown style={{ width: '12px', height: '12px', marginLeft: '4px', opacity: 0.3 }} />;
    return sortOrder === 'desc' 
      ? <ArrowDown style={{ width: '12px', height: '12px', marginLeft: '4px' }} /> 
      : <ArrowUp style={{ width: '12px', height: '12px', marginLeft: '4px' }} />;
  };

  const handleInvestigate = (riskId: string) => {
    setRiskStatuses(prev => ({ ...prev, [riskId]: 'INVESTIGATE' }));
  };

  const handleBlock = (riskId: string) => {
    setRiskStatuses(prev => ({ ...prev, [riskId]: 'BLOCKED' }));
    updateStatus.mutate({ id: riskId, status: RiskStatus.FALSE_POSITIVE });
  };

  const handleApprove = (riskId: string) => {
    setRiskStatuses(prev => ({ ...prev, [riskId]: 'APPROVED' }));
    updateStatus.mutate({ id: riskId, status: RiskStatus.BLOCKED });
  };

  // Reduced padding for compact layout
  const cellPadding = '14px 12px';
  const headerPadding = '12px 12px';

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          padding: '10px',
          backgroundColor: '#fef2f2',
          borderRadius: '10px'
        }}>
          <AlertTriangle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
        </div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#111827',
          margin: 0
        }}>
          Interactive Risk Table ({filteredRisks.length} Risks)
        </h3>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th 
                onClick={() => toggleSort('tenderId')}
                style={{
                  padding: headerPadding,
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  ID <SortIcon colKey="tenderId" />
                </div>
              </th>
              <th 
                onClick={() => toggleSort('score')}
                style={{
                  padding: headerPadding,
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  RISK SCORE <SortIcon colKey="score" />
                </div>
              </th>
              <th style={{ padding: headerPadding, textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>REASON</th>
              <th style={{ padding: headerPadding, textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DISTRICT</th>
              <th style={{ padding: headerPadding, textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SCHEME</th>
              <th style={{ padding: headerPadding, textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TYPE</th>
              <th style={{ padding: headerPadding, textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACTIONS</th>
              <th style={{ padding: headerPadding, textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredRisks.map((risk, idx) => (
                <motion.tr 
                  key={risk.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ borderBottom: '1px solid #f3f4f6' }}
                >
                  <td style={{ padding: cellPadding, fontFamily: 'monospace', fontSize: '13px', color: '#6b7280' }}>
                    {risk.tenderId}
                  </td>
                  <td style={{ padding: cellPadding }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        height: '6px', 
                        width: '60px', 
                        borderRadius: '999px', 
                        backgroundColor: '#e5e7eb',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${risk.score}%`,
                          borderRadius: '999px',
                          backgroundColor: risk.score > 80 ? '#ef4444' : risk.score > 60 ? '#f97316' : '#eab308'
                        }} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{risk.score}%</span>
                    </div>
                  </td>
                  <td style={{ padding: cellPadding, maxWidth: '250px' }}>
                    <p style={{ fontSize: '13px', color: '#4b5563', margin: 0, lineHeight: 1.4 }}>
                      {risk.reason}
                    </p>
                  </td>
                  <td style={{ padding: cellPadding, fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                    {risk.district}
                  </td>
                  <td style={{ padding: cellPadding }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: risk.scheme === SchemeType.PROCUREMENT 
                        ? '#dbeafe' 
                        : risk.scheme === SchemeType.WELFARE
                        ? '#ede9fe'
                        : '#fef3c7',
                      color: risk.scheme === SchemeType.PROCUREMENT 
                        ? '#1e40af' 
                        : risk.scheme === SchemeType.WELFARE
                        ? '#7c3aed'
                        : '#b45309'
                    }}>
                      {risk.scheme}
                    </span>
                  </td>
                  <td style={{ padding: cellPadding, fontSize: '13px', color: '#6b7280' }}>
                    {idx % 2 === 0 ? 'Rule + ML' : 'ML'}
                  </td>
                  <td style={{ padding: cellPadding }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      {/* Blue - Investigate */}
                      <button 
                        onClick={() => handleInvestigate(risk.id)}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.4)',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#3b82f6';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Investigate"
                      >
                        <Eye style={{ width: '14px', height: '14px' }} />
                      </button>
                      
                      {/* Red - Block */}
                      <button 
                        onClick={() => handleBlock(risk.id)}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc2626';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ef4444';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Block"
                      >
                        <X style={{ width: '14px', height: '14px' }} />
                      </button>
                      
                      {/* Green - Approve */}
                      <button 
                        onClick={() => handleApprove(risk.id)}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.4)',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#059669';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#10b981';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Approve"
                      >
                        <Check style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: cellPadding, textAlign: 'center' }}>
                    {riskStatuses[risk.id] ? (
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: riskStatuses[risk.id] === 'INVESTIGATE' 
                          ? '#dbeafe' 
                          : riskStatuses[risk.id] === 'BLOCKED'
                          ? '#fee2e2'
                          : '#dcfce7',
                        color: riskStatuses[risk.id] === 'INVESTIGATE' 
                          ? '#1e40af' 
                          : riskStatuses[risk.id] === 'BLOCKED'
                          ? '#dc2626'
                          : '#16a34a'
                      }}>
                        {riskStatuses[risk.id]}
                      </span>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiskTable;
