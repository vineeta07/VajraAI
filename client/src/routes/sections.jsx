import { lazy, Suspense } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { varAlpha } from "minimal-shared/utils";
import Box from "@mui/material/Box";
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress";
import { DashboardLayout } from "src/layouts/dashboard";
import ProtectedRoute from "src/components/ProtectedRoute";

export const DashboardPage = lazy(() => import("src/pages/dashboard"));
export const RecentFraudsPage = lazy(() => import("src/pages/FraudAlerts"));
export const CitizensPage = lazy(() => import("src/pages/CitizensList"));
export const RegistrationPage = lazy(() => import("src/pages/sign-in"));
export const InvestigationPage = lazy(() => import("src/pages/products"));
export const WhistleblowerPage = lazy(() => import("src/pages/whistleblower"));
export const WhistleblowerReportsPage = lazy(() => import("src/pages/whistleblower-reports"));
export const ProfilePage = lazy(() => import("src/pages/profile"));
export const SettingsPage = lazy(() => import("src/pages/settings"));
export const Page404 = lazy(() => import("src/pages/page-not-found"));
export const HomePage = lazy(() => import("src/pages/Home"));
export const LoginPage = lazy(() => import("src/pages/LoginPage"));
export const UploadPage = lazy(() => import("src/pages/Upload"));
export const AnalyzePage = lazy(() => import("src/pages/Analyzer"));
export const HeatmapPage = lazy(() => import("src/pages/Heatmap"));
export const AnomaliesPage = lazy(() => import("src/pages/Anomalies"));
export const AnomalyDetailPage = lazy(() => import("src/pages/AnomalyDetail"));
export const VendorsPage = lazy(() => import("src/pages/Vendors"));
export const VendorDetailPage = lazy(() => import("src/pages/VendorDetail"));

const renderFallback = () => (
  <Box
    sx={{
      display: "flex",
      flex: "1 1 auto",
      alignItems: "center",
      justifyContent: "center",
      p: 3
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: "text.primary" }
      }}
    />
  </Box>
);

export const routesSection = [
  {
    path: "/",
    element: <HomePage />
  },
  {
    path: "/login",
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: "/sign-in",
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: "/register",
    element: <RegistrationPage />
  },
  {
    path: "/sign-up",
    element: <RegistrationPage />
  },
  {
    element: (
      <ProtectedRoute allowedRoles={['authority', 'user']}>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <ProtectedRoute allowedRoles={['authority', 'user']}><DashboardPage /></ProtectedRoute> },
      { path: "citizens", element: <ProtectedRoute allowedRoles={['authority']}><CitizensPage /></ProtectedRoute> },
      { path: "investigation", element: <ProtectedRoute allowedRoles={['authority']}><InvestigationPage /></ProtectedRoute> },
      { path: "whistleblower", element: <ProtectedRoute allowedRoles={['user']}><WhistleblowerPage /></ProtectedRoute> },
      { path: "whistleblower-reports", element: <ProtectedRoute allowedRoles={['authority']}><WhistleblowerReportsPage /></ProtectedRoute> },
      { path: "fraud-alerts", element: <ProtectedRoute allowedRoles={['authority']}><RecentFraudsPage /></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute allowedRoles={['authority', 'user']}><ProfilePage /></ProtectedRoute> },
      { path: "settings", element: <SettingsPage /> },
      { path: "upload", element: <ProtectedRoute allowedRoles={['authority', 'user']}><UploadPage /></ProtectedRoute> },
      { path: "analyze", element: <ProtectedRoute allowedRoles={['authority', 'user']}><AnalyzePage /></ProtectedRoute> },
      { path: "heatmap", element: <ProtectedRoute allowedRoles={['authority', 'user']}><HeatmapPage /></ProtectedRoute> },
      { path: "anomalies", element: <ProtectedRoute allowedRoles={['authority', 'user']}><AnomaliesPage /></ProtectedRoute> },
      { path: "anomalies/:id", element: <ProtectedRoute allowedRoles={['authority', 'user']}><AnomalyDetailPage /></ProtectedRoute> },
      { path: "vendors", element: <ProtectedRoute allowedRoles={['authority', 'user']}><VendorsPage /></ProtectedRoute> },
      { path: "vendors/:id", element: <ProtectedRoute allowedRoles={['authority', 'user']}><VendorDetailPage /></ProtectedRoute> },
      // Redirect /dashboard base to appropriate page if needed, but path dashboard is specifically for authority
      { path: "", element: <Navigate to="dashboard" replace /> }
    ]
  },
  {
    path: "404",
    element: <Page404 />
  },
  { path: "*", element: <Page404 /> }
];
