import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  FileWarning, 
  UserCircle, 
  Settings, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  // Define menu items for cleaner rendering
  const menuItems = [
    { 
      title: "Dashboard", 
      path: "/dashboard", 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      title: "Investigation Portal", 
      path: "/investigation", 
      icon: <ShieldCheck size={20} /> 
    },
    { 
      title: "Citizens List", 
      path: "/citizens", 
      icon: <Users size={20} /> 
    },
    { 
      title: "Fraud Alerts", 
      path: "/fraud-alerts", 
      icon: <FileWarning size={20} /> 
    },
    { 
      title: "Profile", 
      path: "/profile", 
      icon: <UserCircle size={20} /> 
    },
    { 
      title: "Settings", 
      path: "/settings", 
      icon: <Settings size={20} /> 
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white text-gray-600 font-sans">
      
      {/* 1. Logo Section */}
      <div className="flex flex-col items-center justify-center py-8 border-b border-gray-100 mb-6">
        {/* Placeholder for the logo image from your screenshot */}
        <div className="w-20 h-20 mb-3 relative">
            {/* Replace src with your actual logo asset */}
            <img 
              src="/logo-placeholder.png" 
              alt="Vajra AI Logo" 
              className="w-full h-full object-contain"
            />
        </div>
        <h1 className="text-blue-900 font-bold text-lg tracking-wide">VAJRA AI</h1>
        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-1">
          Public Integrity System
        </p>
      </div>

      {/* 2. Navigation Links */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive 
                ? 'bg-blue-50 text-blue-600 shadow-sm' // Active State (Light Blue)
                : 'hover:bg-gray-50 hover:text-gray-900' // Hover State
              }
            `}
          >
            {/* Icon Wrapper */}
            <span className="shrink-0">{item.icon}</span>
            
            {/* Text */}
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* 3. Logout Section */}
      <div className="p-4 mt-auto border-t border-gray-100">
        <button 
          className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          onClick={() => console.log("Logout clicked")}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

    </div>
  );
};

export default Sidebar;