import React from "react";
import { PolylineHighlightContext } from "@/contexts/polyline-highlight-context";

/**
 * Custom hook to use the PolylineHighlight context
 * This hook provides access to polyline highlighting functionality
 */
export const usePolylineHighlight = () => {
  const context = React.useContext(PolylineHighlightContext);
  if (context === undefined) {
    throw new Error("usePolylineHighlight must be used within an PolylineHighlightProvider");
  }
  return context;
};
