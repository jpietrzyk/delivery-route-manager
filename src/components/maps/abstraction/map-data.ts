/**
 * Map Data Interfaces - Minimal data structures for map rendering
 * These interfaces contain only the data needed for map visualization,
 * avoiding over-coupling with domain models like Order
 */

export interface MapMarkerData {
  id: string;
  location: {
    lat: number;
    lng: number;
  };
  type: 'delivery' | 'pool' | 'pool-high-value';
  waypointIndex?: number; // 1-based position in delivery route when applicable
  isHighlighted?: boolean;
  isCurrentOrder?: boolean;
  isPreviousOrder?: boolean;
  isDisabled?: boolean; // True for filtered-out markers (shown but grayed and non-clickable)
  popupContent?: React.ReactNode;
}

export interface MapRouteSegmentData {
  id: string;
  from: {
    lat: number;
    lng: number;
  };
  to: {
    lat: number;
    lng: number;
  };
  positions?: Array<{
    lat: number;
    lng: number;
  }>; // Full polyline path (optional, falls back to straight line)
  isHighlighted?: boolean;
  highlightColor?: string;
  distance?: number; // meters
  duration?: number; // seconds
}

export interface MapBounds {
  points: Array<{
    lat: number;
    lng: number;
  }>;
}
