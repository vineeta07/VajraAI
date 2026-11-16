import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppShell from '@/layouts/AppShell';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';

const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Anomalies = lazy(() => import('@/pages/Anomalies'));
const AnomalyDetail = lazy(() => import('@/pages/AnomalyDetail'));
const Vendors = lazy(() => import('@/pages/Vendors'));
const VendorDetail = lazy(() => import('@/pages/VendorDetail'));
const RiskMap = lazy(() => import('@/pages/RiskMap'));
const Upload = lazy(() => import('@/pages/Upload'));
const Settings = lazy(() => import('@/pages/Settings'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15000,
      refetchOnWindowFocus: false,
      // Retrying a refused connection only delays the explanation.
      retry: (count, error) => count < 1 && Boolean(error.response) && error.response.status >= 500 && error.response.data !== '',
    },
  },
});

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <ErrorBoundary>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/sign-in" element={<Navigate to="/login" replace />} />
                <Route path="/register" element={<Register />} />
                <Route path="/sign-up" element={<Navigate to="/register" replace />} />
                <Route element={<RequireAuth><AppShell /></RequireAuth>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/anomalies" element={<Anomalies />} />
                  <Route path="/anomalies/:id" element={<AnomalyDetail />} />
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/vendors/:id" element={<VendorDetail />} />
                  <Route path="/risk-map" element={<RiskMap />} />
                  <Route path="/heatmap" element={<Navigate to="/risk-map" replace />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/analyze" element={<Navigate to="/upload" replace />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--surface)',
                color: 'var(--ink)',
                border: '1px solid var(--line)',
                boxShadow: 'var(--shadow-pop)',
                fontSize: 14,
                borderRadius: 8,
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
