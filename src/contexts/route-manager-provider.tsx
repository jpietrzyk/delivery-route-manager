import React, { useState } from "react";
import { RouteManagerContext } from "./route-manager-context";
import { RouteManager } from "@/services/RouteManager";

export default function RouteManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [routeManager, setRouteManager] = useState<RouteManager | null>(null);

  return (
    <RouteManagerContext.Provider value={{ routeManager, setRouteManager }}>
      {children}
    </RouteManagerContext.Provider>
  );
}
