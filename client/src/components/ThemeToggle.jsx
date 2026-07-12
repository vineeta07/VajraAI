import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle({ className = '' }) {
    const { theme, toggleTheme, mounted } = useTheme();

    // Prevent flash during SSR
    if (!mounted) {
        return (
            <div className={`w-8 h-8 ${className}`} aria-hidden="true" />
        );
    }

    const isDark = theme === 'dark';

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
        }
    };

    return (
        <motion.button
            onClick={toggleTheme}
            onKeyDown={handleKeyDown}
            className={`relative w-8 h-8 rounded-lg flex items-center justify-center
        bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80
        backdrop-blur-sm border border-slate-300 dark:border-slate-700
        transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2
        dark:focus:ring-offset-slate-900 ${className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            role="button"
            tabIndex={0}
        >
            <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                    <motion.div
                        key="sun"
                        initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <Sun className="w-4 h-4 text-amber-500" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="moon"
                        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <Moon className="w-4 h-4 text-indigo-500" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Glow effect on hover */}
            <motion.div
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 dark:from-cyan-500/30 dark:to-indigo-500/30 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
            />
        </motion.button>
    );
}
