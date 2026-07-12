import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-sans transition-colors duration-500 border-r border-slate-100 dark:border-slate-800">

      {/* 1. Logo Section */}
      <div className="flex flex-col items-center justify-center py-10 border-b border-slate-100 dark:border-slate-800 mb-6 transition-colors duration-500">
        <div className="w-20 h-20 mb-4 relative">
          <img
            src="/logo-placeholder.png"
            alt="Vajra AI Logo"
            className="w-full h-full object-contain filter dark:drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          />
        </div>
        <h1 className="text-slate-900 dark:text-cyan-400 font-black text-xl tracking-wider transition-colors duration-500">VAJRA AI</h1>
        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1 transition-colors duration-500">
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
                ? 'bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 shadow-sm' // Active State
                : 'hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100' // Hover State
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
      <div className="p-4 mt-auto border-t border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <button
          className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors duration-200"
          onClick={() => navigate('/')}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

    </div>
  );
};

export default Sidebar;