import React from "react";
import { OrderRouteContext } from "@/contexts/order-route-context";

/**
 * Custom hook to use the OrderRoute context
 * This hook provides access to order routing functionality
 */
export const useOrderRoute = () => {
  const context = React.useContext(OrderRouteContext);
  if (context === undefined) {
    throw new Error("useOrderRoute must be used within an OrderRouteProvider");
  }
  return context;
};
