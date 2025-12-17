import React, { useState } from "react";
import { RouteManagerContext } from "./RouteManagerContext";
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
