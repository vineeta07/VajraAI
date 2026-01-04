import { Share2 } from 'lucide-react';
import React, { Suspense, useState } from 'react';

import RiskTable  from './RiskTable';
import { SchemeType } from '../types';
import GraphNetwork  from './GraphNetwork';
import  SavingsTracker  from './SavingTracker';


// Add or adjust the type as needed for your actual props
type ProductsViewProps = {
  darkMode: boolean;
  // Add other props here if needed
};

function ProductsView({
  darkMode,
  // ...other props...
}: ProductsViewProps) {
  // You may need to define or receive isDarkMode and activeScheme as props or state
  const isDarkMode = darkMode;
  const [activeScheme, setActiveScheme] = useState<SchemeType>(SchemeType.ALL);

  return (
    <div 
      className="min-h-screen p-10"
      style={{ 
        backgroundColor: '#ffffff'
      }}
    >
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ 
                background: isDarkMode 
                  ? 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Vajra Intelligence Portal
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Actionable ML-driven financial safeguards.
            </p>
          </div>
          <div 
            className="flex p-1 rounded-xl shadow-lg transition-colors duration-300"
            style={{ 
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
            }}
          >
            {(Object.values(SchemeType)).map((scheme) => {
              const getSchemeColor = (schemeName: string) => {
                switch(schemeName) {
                  case 'Procurement': return { bg: '#3b82f6', text: '#dbeafe' };
                  case 'Welfare': return { bg: '#8b5cf6', text: '#ede9fe' };
                  case 'Spending': return { bg: '#f59e0b', text: '#fef3c7' };
                  default: return { bg: '#6366f1', text: '#e0e7ff' };
                }
              };
              const colors = getSchemeColor(scheme);
              
              return (
                <button
                  key={scheme}
                  onClick={() => setActiveScheme(scheme)}
                  className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                  style={
                    activeScheme === scheme 
                      ? {
                          backgroundColor: colors.bg,
                          color: 'white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }
                      : {
                          backgroundColor: 'transparent',
                          color: isDarkMode ? '#94a3b8' : '#64748b'
                        }
                  }
                  onMouseEnter={(e) => {
                    if (activeScheme !== scheme) {
                      e.currentTarget.style.color = isDarkMode ? '#cbd5e1' : '#475569';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeScheme !== scheme) {
                      e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#64748b';
                    }
                  }}
                >
                  {scheme}
                </button>
              );
            })}
          </div>
        </div>

        <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse rounded-xl" />}>
          <SavingsTracker isDarkMode={isDarkMode} />
        </Suspense>

        <div className="flex flex-col gap-8">
          <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
            <RiskTable filterScheme={activeScheme} isDarkMode={isDarkMode} />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12" style={{ minHeight: '450px' }}>
          <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column' }}>
            <Suspense fallback={<div className="h-[600px] bg-gray-100 animate-pulse rounded-xl" />}>
              <GraphNetwork isDarkMode={isDarkMode} />
            </Suspense>
          </div>
          <div className="lg:col-span-1" style={{ display: 'flex', flexDirection: 'column' }}>
            <div 
              className="p-6 rounded-2xl transition-colors duration-300"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                flex: 1
              }}
            >
              <h4 
                className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2"
                style={{ color: '#64748b' }}
              >
                <Share2 
                  className="w-4 h-4" 
                  style={{ color: '#6366f1' }}
                />
                Network Risk Summary
              </h4>
              <div className="space-y-6">
                <div>
                  <div 
                    className="text-xs font-medium mb-2"
                    style={{ color: '#64748b' }}
                  >
                    Node Connectivity
                  </div>
                  <div 
                    className="text-center text-3xl font-bold mb-3"
                    style={{ color: '#6366f1' }}
                  >
                    88.4%
                  </div>
                  <div 
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: '#e5e7eb' }}
                  >
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: '88.4%',
                        backgroundColor: '#6366f1'
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <div 
                    className="text-xs font-medium mb-2"
                    style={{ color: '#64748b' }}
                  >
                    Cross-District Links
                  </div>
                  <div 
                    className="text-center text-3xl font-bold mb-3"
                    style={{ color: '#f59e0b' }}
                  >
                    1,242
                  </div>
                  <div 
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: '#e5e7eb' }}
                  >
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: '75%',
                        backgroundColor: '#f59e0b'
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <div 
                    className="text-xs font-medium mb-2"
                    style={{ color: '#64748b' }}
                  >
                    High Risk Transactions
                  </div>
                  <div 
                    className="text-center text-3xl font-bold mb-3"
                    style={{ color: '#dc2626' }}
                  >
                    23%
                  </div>
                  <div 
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: '#e5e7eb' }}
                  >
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: '23%',
                        backgroundColor: '#dc2626'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsView;
export { ProductsView };