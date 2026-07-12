import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from "./theme/theme-provider";
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { routesSection } from "./routes/sections";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "./global.css";

function AppRoutes() {
  const routing = useRoutes(routesSection);
  return routing;
}

const queryClient = new QueryClient();

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <MuiThemeProvider>
            <AuthProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </AuthProvider>
          </MuiThemeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
