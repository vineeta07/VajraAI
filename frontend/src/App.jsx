import { HelmetProvider } from 'react-helmet-async';
import { useRoutes, BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./theme/theme-provider";
import { routesSection } from "./routes/sections";
import "./global.css";

function Router() {
  return useRoutes(routesSection);
}

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
         <BrowserRouter>
            <Router />
         </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  );
}
