import React, { useMemo } from 'react';
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as ThemeVarsProvider } from "@mui/material/styles";
import { createTheme } from "./create-theme";
import { useTheme } from "../hooks/useTheme";

export function ThemeProvider({ themeOverrides, children, ...other }) {
  const { theme: mode } = useTheme();

  const theme = useMemo(() => {
    const baseTheme = createTheme(mode, {
      themeOverrides,
    });

    return baseTheme;
  }, [mode, themeOverrides]);

  return (
    <ThemeVarsProvider disableTransitionOnChange theme={theme} mode={mode} {...other}>
      <CssBaseline />
      {children}
    </ThemeVarsProvider>
  );
}
