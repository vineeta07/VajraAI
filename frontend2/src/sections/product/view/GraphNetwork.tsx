import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { NETWORK_DATA } from '../constants';

interface GraphNetworkProps {
  isDarkMode?: boolean;
}

const GraphNetwork: React.FC<GraphNetworkProps> = ({ isDarkMode }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const nodes = useMemo(() => NETWORK_DATA.nodes, []);
  const links = useMemo(() => NETWORK_DATA.links, []);

  const centerX = 200;
  const centerY = 150;
  const radius = 100;

  const nodePositions = useMemo(() =>
    nodes.map((n: typeof nodes[0], i: number) => {
      const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
      return { ...n, x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius };
    })
  , [nodes]);

  const linksWithPositions = useMemo(() =>
    links.map((l: typeof links[0]) => ({
      ...l,
      sourcePos: nodePositions.find((n: typeof nodePositions[0]) => n.id === l.source),
      targetPos: nodePositions.find((n: typeof nodePositions[0]) => n.id === l.target)
    }))
  , [links, nodePositions]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ 
        padding: '20px 24px', 
        borderBottom: '1px solid #f3f4f6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Collusion Network</h4>
          <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px', marginBottom: 0 }}>
            Cross-firm Analysis
          </p>
        </div>
        <button style={{ 
          padding: '8px', 
          backgroundColor: 'transparent', 
          border: 'none', 
          cursor: 'pointer',
          borderRadius: '8px'
        }}>
          <RefreshCw style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
        </button>
      </div>
      
      {/* Graph Area - Takes remaining space */}
      <div style={{ flex: 1, position: 'relative', padding: '8px', minHeight: 0 }}>
        <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
          {linksWithPositions.map((link, idx) => (
            <line
              key={idx}
              x1={link.sourcePos?.x} y1={link.sourcePos?.y}
              x2={link.targetPos?.x} y2={link.targetPos?.y}
              stroke={hoveredNode === link.source || hoveredNode === link.target ? '#6366f1' : '#e5e7eb'}
              strokeWidth={hoveredNode === link.source || hoveredNode === link.target ? 2 : 1}
            />
          ))}

          {nodePositions.map((node) => (
            <g 
              key={node.id} 
              onMouseEnter={() => setHoveredNode(node.id)} 
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer' }}
            >
              <motion.circle
                animate={{ r: (node.val / 2.5) + (hoveredNode === node.id ? 4 : 0) }}
                transition={{ duration: 0.2 }}
                cx={node.x} cy={node.y}
                fill={node.type === 'firm' ? (node.risk! > 80 ? '#f43f5e' : '#6366f1') : '#f59e0b'}
                fillOpacity={0.9}
              />
              {hoveredNode === node.id && (
                <>
                  <rect
                    x={node.x - 50}
                    y={node.y - 28}
                    width="100"
                    height="22"
                    rx="6"
                    fill="white"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <text 
                    x={node.x} 
                    y={node.y - 13} 
                    textAnchor="middle" 
                    style={{ fontSize: '11px', fontWeight: 600, fill: '#111827' }}
                  >
                    {node.name}
                  </text>
                </>
              )}
            </g>
          ))}
        </svg>

        {/* Legend - Positioned at bottom */}
        <div style={{ 
          position: 'absolute', 
          bottom: '12px', 
          left: '12px', 
          padding: '10px 14px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { label: 'Suspicious Firm', color: '#f43f5e' },
              { label: 'Verified Firm', color: '#6366f1' },
              { label: 'Official/Tender', color: '#f59e0b' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphNetwork;
