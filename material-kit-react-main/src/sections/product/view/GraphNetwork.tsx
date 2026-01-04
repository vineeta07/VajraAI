import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, LayoutGrid } from 'lucide-react';

import { NETWORK_DATA } from '../constants';

// Add isDarkMode prop
interface GraphNetworkProps {
  isDarkMode?: boolean;
}

const GraphNetwork: React.FC<GraphNetworkProps> = ({ isDarkMode }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const nodes = useMemo(() => NETWORK_DATA.nodes, []);
  const links = useMemo(() => NETWORK_DATA.links, []);

  const centerX = 250;
  const centerY = 250;
  const radius = 160;

  const nodePositions = useMemo(() =>
    nodes.map((n: typeof nodes[0], i: number) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
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

  // Optionally use isDarkMode for styling if needed

  return (
    <div className="bg-white rounded-3xl card-shadow border border-gray-100 overflow-hidden flex flex-col" style={{ height: '100%', minHeight: '450px' }}>
      <div className="p-4 border-b border-gray-50 flex items-center justify-between">
         <div>
            <h4 className="font-bold text-sm">Collusion Network</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Cross-firm Analysis</p>
         </div>
         <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors"><RefreshCw className="w-4 h-4 text-gray-400" /></button>
      </div>
      
      <div className="flex-1 relative p-2">
        <svg width="100%" height="100%" viewBox="0 0 500 500">
          {linksWithPositions.map((link, idx) => (
            <line
              key={idx}
              x1={link.sourcePos?.x} y1={link.sourcePos?.y}
              x2={link.targetPos?.x} y2={link.targetPos?.y}
              stroke={hoveredNode === link.source || hoveredNode === link.target ? '#4F46E5' : '#E2E8F0'}
              strokeWidth={hoveredNode === link.source || hoveredNode === link.target ? 2 : 1}
              className="transition-all duration-300"
            />
          ))}

          {nodePositions.map((node) => (
            <g key={node.id} onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)}>
              <motion.circle
                animate={{ r: node.val / 2 + (hoveredNode === node.id ? 4 : 0) }}
                cx={node.x} cy={node.y}
                fill={node.type === 'firm' ? (node.risk! > 80 ? '#F43F5E' : '#4F46E5') : '#F59E0B'}
                fillOpacity={0.9}
                className="cursor-pointer"
              />
              {hoveredNode === node.id && (
                <text x={node.x} y={node.y - 20} textAnchor="middle" className="text-[12px] font-bold fill-gray-800 pointer-events-none">
                  {node.name}
                </text>
              )}
            </g>
          ))}
        </svg>

        <div className="absolute bottom-6 left-6 p-4 bg-gray-50/80 rounded-2xl flex flex-col gap-2">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[8px] font-black uppercase text-gray-500">Suspicious Firm</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-[8px] font-black uppercase text-gray-500">Verified Firm</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GraphNetwork;
