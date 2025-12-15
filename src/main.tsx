import "./index.css";
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import MarkerHighlightProvider from "@/contexts/MarkerHighlightProvider";
import DeliveryProvider from "@/contexts/DeliveryProvider";
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <MarkerHighlightProvider>
      <DeliveryProvider>
        <App />
      </DeliveryProvider>
    </MarkerHighlightProvider>
  </React.StrictMode>
);
