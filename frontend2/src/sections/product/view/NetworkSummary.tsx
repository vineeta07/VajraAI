import React from 'react';
import { Share2 } from 'lucide-react';

interface NetworkSummaryProps {
  isDarkMode?: boolean;
}

const NetworkSummary: React.FC<NetworkSummaryProps> = ({ isDarkMode }) => (
  <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
    {/* Header */}
    <div className="px-6 py-5 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Share2 className="w-5 h-5 text-indigo-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
          Network Risk Summary
        </h3>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 p-8 space-y-8">
      {/* Node Connectivity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Node Connectivity</span>
          <span className="text-3xl font-bold text-indigo-600">88.4%</span>
        </div>
      </div>

      {/* Cross-District Links */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Cross-District Links</span>
          <span className="text-3xl font-bold text-orange-500">1,242</span>
        </div>
      </div>
    </div>
  </div>
);

export default NetworkSummary;