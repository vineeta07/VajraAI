import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'vajraai-theme';
const ThemeContext = createContext(null);

const systemTheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

export function ThemeProvider({ children }) {
  const [choice, setChoice] = useState(() => localStorage.getItem(KEY) || 'system');
  const [system, setSystem] = useState(systemTheme);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystem(systemTheme());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const theme = choice === 'system' ? system : choice;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (next === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, next);
    setChoice(next);
  }, []);

  const value = useMemo(
    () => ({ theme, choice, isDark: theme === 'dark', setTheme, toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark') }),
    [theme, choice, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
