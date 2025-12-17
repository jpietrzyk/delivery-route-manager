import "./index.css";
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import MarkerHighlightProvider from "@/contexts/marker-highlight-provider";
import DeliveryProvider from "@/contexts/delivery-provider";
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
