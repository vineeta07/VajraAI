import "leaflet/dist/leaflet.css";
import "./global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
const queryClient = new QueryClient();
const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
