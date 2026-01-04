
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
      <div className={`w-full h-96 flex items-center justify-center rounded-xl border ${
        isDarkMode ? 'bg-[#1c252e] border-slate-800' : 'bg-white border-gray-100 card-shadow'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"/>
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
    if (sortKey !== colKey) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30" />;
    return sortOrder === 'desc' ? <ArrowDown className="w-3 h-3 ml-1" /> : <ArrowUp className="w-3 h-3 ml-1" />;
  };

  const tableBg = isDarkMode ? 'bg-[#1c252e] border-slate-800' : 'bg-white border-gray-100 card-shadow';
  const headerBg = isDarkMode ? 'bg-[#212b36]' : 'bg-gray-50';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const subTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`w-full rounded-xl overflow-hidden transition-all duration-300 border ${tableBg}`}>
      <div className={`p-6 flex items-center gap-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-50'}`}>
        <AlertTriangle className={`w-6 h-6 ${isDarkMode ? 'text-rose-400' : 'text-rose-500'}`} />
        <h3 className={`text-xl font-bold tracking-tight ${textColor}`}>
          Interactive Risk Table ({filteredRisks.length} Risks)
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`${headerBg} text-[13px] font-bold ${subTextColor} uppercase tracking-wider`}>
              <th 
                className="px-6 py-5 cursor-pointer hover:text-indigo-400 transition-colors"
                onClick={() => toggleSort('tenderId')}
              >
                <div className="flex items-center">ID <SortIcon colKey="tenderId" /></div>
              </th>
              <th 
                className="px-6 py-5 cursor-pointer hover:text-indigo-400 transition-colors"
                onClick={() => toggleSort('score')}
              >
                <div className="flex items-center">Risk Score <SortIcon colKey="score" /></div>
              </th>
              <th className="px-6 py-5">Reason</th>
              <th className="px-6 py-5">District</th>
              <th className="px-6 py-5">Scheme</th>
              <th className="px-6 py-5">Type</th>
              <th className="px-6 py-5 text-center">Actions</th>
              <th className="px-6 py-5 text-center">Status</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/50' : 'divide-gray-50'}`}>
            <AnimatePresence>
              {filteredRisks.map((risk, idx) => (
                <motion.tr 
                  key={risk.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`transition-colors group ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                >
                  <td className={`px-6 py-6 font-mono text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {risk.tenderId}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-10 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${risk.score}%` }} />
                      </div>
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{risk.score}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 max-w-xs">
                    <p className={`text-sm leading-snug ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                      {risk.reason.split(' + ').map((part, i) => (
                        <span key={i}>{part}{i < risk.reason.split(' + ').length - 1 ? ' + ' : ''}<br/></span>
                      ))}
                    </p>
                  </td>
                  <td className={`px-6 py-6 text-sm ${subTextColor}`}>
                    {risk.district}
                  </td>
                  <td className="px-6 py-6">
                    <span 
                      className="px-3 py-1 rounded-md text-xs font-bold border"
                      style={{
                        backgroundColor: risk.scheme === SchemeType.PROCUREMENT 
                          ? '#3b82f6' 
                          : risk.scheme === SchemeType.WELFARE
                          ? '#8b5cf6'
                          : '#f59e0b',
                        color: 'white',
                        borderColor: 'transparent'
                      }}
                    >
                      {risk.scheme}
                    </span>
                  </td>
                  <td className={`px-6 py-6 text-sm ${subTextColor}`}>
                    {idx % 2 === 0 ? 'Rule + ML' : 'ML'}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        className="p-2 rounded-md transition-all shadow-md active:scale-95"
                        style={{ backgroundColor: '#3b82f6', color: 'white' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                        onClick={() => {
                          setRiskStatuses(prev => ({ ...prev, [risk.id]: 'INVESTIGATE' }));
                        }}
                        title="Investigation"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setRiskStatuses(prev => ({ ...prev, [risk.id]: 'BLOCKED' }));
                          updateStatus.mutate({ id: risk.id, status: RiskStatus.FALSE_POSITIVE });
                        }}
                        className="p-2 rounded-md transition-all shadow-md active:scale-95"
                        style={{ backgroundColor: '#dc2626', color: 'white' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                        title="Block"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setRiskStatuses(prev => ({ ...prev, [risk.id]: 'APPROVED' }));
                          updateStatus.mutate({ id: risk.id, status: RiskStatus.BLOCKED });
                        }}
                        className="p-2 rounded-md transition-all shadow-md active:scale-95"
                        style={{ backgroundColor: '#16a34a', color: 'white' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                        title="Approve"
                      >
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    {riskStatuses[risk.id] && (
                      <span 
                        className="px-3 py-1 rounded-md text-xs font-bold"
                        style={{
                          backgroundColor: riskStatuses[risk.id] === 'INVESTIGATE' 
                            ? '#3b82f6' 
                            : riskStatuses[risk.id] === 'BLOCKED'
                            ? '#dc2626'
                            : '#16a34a',
                          color: 'white'
                        }}
                      >
                        {riskStatuses[risk.id]}
                      </span>
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
