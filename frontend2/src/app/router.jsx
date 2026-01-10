import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Import the Layout
import Layout from './Layout';

// Import Page Components
import Dashboard from './../pages/Dashboard';
import FraudAlerts from './../pages/FraudAlerts';
import InvestigationPortal from './../pages/InvestigationPortal';
import CitizensList from './../pages/CitizensList';
import Profile from './../pages/Profile';
import Settings from './../pages/Settings';

// 1. Define the Routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // This is the persistent frame (Sidebar + Navbar)
    errorElement: <div className="p-4">404 - Page Not Found</div>,
    children: [
      // Redirect root path "/" to "/dashboard" automatically
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      // Individual Pages render inside the Layout's <Outlet />
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "fraud-alerts",
        element: <FraudAlerts />,
      },
      {
        path: "investigation",
        element: <InvestigationPortal />,
      },
      {
        path: "citizens",
        element: <CitizensList />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
  // If you had a Login page without the sidebar, you would add it here outside the Layout
  // {
  //   path: "/login",
  //   element: <Login />,
  // }
]);

// 2. Export the Router Component
const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;