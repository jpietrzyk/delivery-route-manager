import React from "react";
import { OrderHighlightContext } from "@/contexts/order-highlight-context";

/**
 * Custom hook to use the OrderHighlight context
 * This hook provides access to order highlighting functionality
 */
export const useOrderHighlight = () => {
  const context = React.useContext(OrderHighlightContext);
  if (context === undefined) {
    throw new Error("useOrderHighlight must be used within an OrderHighlightProvider");
  }
  return context;
};
