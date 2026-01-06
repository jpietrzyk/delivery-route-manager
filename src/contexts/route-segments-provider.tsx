import React, { useState } from "react";
import {
  RouteSegmentsContext,
  type RouteSegmentData,
} from "./route-segments-context";

export default function RouteSegmentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [routeSegments, setRouteSegments] = useState<RouteSegmentData[]>([]);

  return (
    <RouteSegmentsContext.Provider value={{ routeSegments, setRouteSegments }}>
      {children}
    </RouteSegmentsContext.Provider>
  );
}
