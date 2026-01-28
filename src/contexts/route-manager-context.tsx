import { createContext } from "react";
import { RouteManager } from "@/services/route-manager";

export type RouteManagerContextType = {
  routeManager: RouteManager | null;
  setRouteManager: (manager: RouteManager) => void;
};

export const RouteManagerContext = createContext<
  RouteManagerContextType | undefined
>(undefined);
