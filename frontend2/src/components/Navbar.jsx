import React from 'react';
import { Search, Globe } from 'lucide-react';

const Navbar = () => {
  return (
    <div className="w-full h-16 flex items-center justify-between px-6 bg-white">
      
      {/* Left side: Page Title (Optional - often dynamic based on route) */}
      <div className="text-xl font-semibold text-gray-800">
        {/* You can make this dynamic later using useLocation if needed */}
        Fraud Alerts
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-6">
        
        {/* Search Icon */}
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Search size={20} />
        </button>

        {/* Language Selector */}
        <button className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <Globe size={20} />
          <span className="text-sm font-medium">English</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-700">Admin User</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
          
          <button className="relative">
            {/* Avatar Image */}
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="User Avatar" 
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm hover:shadow-md transition-shadow"
            />
            {/* Online Status Dot */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Navbar;