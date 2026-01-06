import { createContext } from "react";

export interface RouteSegmentData {
  id: string;
  fromOrderId: string;
  toOrderId: string;
  distance: number; // in meters
  duration: number; // in seconds
}

export type RouteSegmentsContextType = {
  routeSegments: RouteSegmentData[];
  setRouteSegments: (segments: RouteSegmentData[]) => void;
};

export const RouteSegmentsContext = createContext<
  RouteSegmentsContextType | undefined
>(undefined);
