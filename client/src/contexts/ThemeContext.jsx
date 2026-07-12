import React, { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext();

// Debounce helper
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState('dark');
    const [mounted, setMounted] = useState(false);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const storedTheme = localStorage.getItem('vajraai-theme');

        if (storedTheme) {
            setThemeState(storedTheme);
            applyTheme(storedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const systemTheme = prefersDark ? 'dark' : 'light';
            setThemeState(systemTheme);
            applyTheme(systemTheme);
        }

        setMounted(true);
    }, []);

    // Apply theme to document
    const applyTheme = (newTheme) => {
        const root = document.documentElement;

        if (newTheme === 'dark') {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
            root.setAttribute('data-color-scheme', 'dark');
        } else {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
            root.setAttribute('data-color-scheme', 'light');
        }
    };

    // Debounced localStorage update
    const updateLocalStorage = useCallback(
        debounce((newTheme) => {
            localStorage.setItem('vajraai-theme', newTheme);
        }, 300),
        []
    );

    // Set theme function
    const setTheme = useCallback((newTheme) => {
        setThemeState(newTheme);
        applyTheme(newTheme);
        updateLocalStorage(newTheme);

        // Announce to screen readers
        const announcement = `Theme changed to ${newTheme} mode`;
        const liveRegion = document.getElementById('theme-announcement');
        if (liveRegion) {
            liveRegion.textContent = announcement;
        }
    }, [updateLocalStorage]);

    // Toggle theme
    const toggleTheme = useCallback(() => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }, [theme, setTheme]);

    // Listen for storage changes (sync across tabs)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'vajraai-theme' && e.newValue) {
                setThemeState(e.newValue);
                applyTheme(e.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Listen for system preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e) => {
            const storedTheme = localStorage.getItem('vajraai-theme');
            // Only update if user hasn't set a preference
            if (!storedTheme) {
                const newTheme = e.matches ? 'dark' : 'light';
                setThemeState(newTheme);
                applyTheme(newTheme);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const value = {
        theme,
        isDark: theme === 'dark',
        isSystem: !localStorage.getItem('vajraai-theme'),
        toggleTheme,
        setTheme,
        mounted
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
            {/* Screen reader announcement region */}
            <div
                id="theme-announcement"
                className="sr-only"
                role="status"
                aria-live="polite"
                aria-atomic="true"
            />
        </ThemeContext.Provider>
    );
}
