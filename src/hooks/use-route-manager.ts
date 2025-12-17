import { useContext } from "react";
import { RouteManagerContext } from "@/contexts/route-manager-context";

export const useRouteManager = () => {
  const context = useContext(RouteManagerContext);
  if (context === undefined) {
    throw new Error("useRouteManager must be used within a RouteManagerProvider");
  }
  return context;
};
