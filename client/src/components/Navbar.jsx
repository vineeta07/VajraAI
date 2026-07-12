import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const LANGS = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिंदी" },
];

const Navbar = () => { 
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [lang, setLang] = useState("en");
  const navigate = useNavigate();

  const handleLangChange = (code) => {
    setLang(code);
    setShowLang(false);
  };

  const handleLogin = () => {
    console.log("Navigating to /login");
    navigate("/login");
  };

  const handleSignUp = () => {
    console.log("Navigating to /register");
    navigate("/register");
  };

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 w-full z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-theme duration-300"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-8 lg:pl-32 lg:pr-16 text-slate-900 dark:text-slate-50 transition-colors">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-cyan-400">
          <span className="bg-indigo-600 dark:bg-cyan-500 rounded-full w-7 h-7 flex items-center justify-center text-white font-black">V</span>
          VajraAI
        </Link>
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={handleLogin}
            className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors font-medium"
          >
            View Demo
          </button>
          <button
            onClick={handleLogin}
            className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors font-medium"
          >
            Login
          </button>
          <button
            onClick={handleSignUp}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white font-semibold transition shadow-lg shadow-indigo-500/25 dark:shadow-cyan-500/30"
          >
            Join Network
          </button>
          <div className="relative">
            <button
              onClick={() => setShowLang(!showLang)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-theme duration-300"
              aria-label="Language Toggle"
            >
              <Globe size={16} />
              {LANGS.find(l => l.code === lang).label}
              <svg width="16" height="16" fill="none" className={`ml-1 transition-transform ${showLang ? 'rotate-180' : ''}`}><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
            <AnimatePresence>
              {showLang && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden"
                >
                  {LANGS.map(l => (
                    <button
                      key={l.code}
                      onClick={() => handleLangChange(l.code)}
                      className={`block w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${lang === l.code ? "font-bold text-indigo-600 dark:text-cyan-400" : ""}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ThemeToggle />
        </div>
        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            aria-label="Open Menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-indigo-600 dark:text-cyan-400 focus:outline-none"
          >
            <svg width="28" height="28" fill="none"><path d="M6 9h16M6 15h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>
      {/* Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 py-4 transition-theme duration-300"
          >
            <button
              onClick={handleLogin}
              className="block w-full mb-2 px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
            >
              View Demo
            </button>
            <button
              onClick={handleLogin}
              className="block w-full mb-2 px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
            >
              Login
            </button>
            <button
              onClick={handleSignUp}
              className="block w-full mb-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white font-semibold transition"
            >
              Sign In
            </button>
            <div className="flex gap-2 mt-2 items-center">
              {LANGS.map(l => (
                <button
                  key={l.code}
                  onClick={() => handleLangChange(l.code)}
                  className={`px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 ${lang === l.code ? "font-bold text-indigo-600 dark:text-cyan-400" : ""}`}
                >
                  {l.label}
                </button>
              ))}
              <ThemeToggle className="ml-auto" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;