import { useContext } from "react";
import { RouteSegmentsContext } from "@/contexts/route-segments-context";

export const useRouteSegments = () => {
  const context = useContext(RouteSegmentsContext);
  if (context === undefined) {
    throw new Error("useRouteSegments must be used within a RouteSegmentsProvider");
  }
  return context;
};
