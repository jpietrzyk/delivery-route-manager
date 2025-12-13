import "./index.css";
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import MarkerHighlightProvider from "@/contexts/MarkerHighlightProvider";
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <MarkerHighlightProvider>
      <App />
    </MarkerHighlightProvider>
  </React.StrictMode>
);
