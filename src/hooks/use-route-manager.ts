import { useContext } from "react";
import { RouteManagerContext } from "@/contexts/RouteManagerContext";

export const useRouteManager = () => {
  const context = useContext(RouteManagerContext);
  if (context === undefined) {
    throw new Error("useRouteManager must be used within a RouteManagerProvider");
  }
  return context;
};
