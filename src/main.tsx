import "./index.css";
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MapFiltersProvider } from "@/contexts/MapFiltersContext";
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <MapFiltersProvider>
      <App />
    </MapFiltersProvider>
  </React.StrictMode>,
);
