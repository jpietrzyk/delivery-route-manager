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
  isHighlighted?: boolean;
  isCurrentOrder?: boolean;
  isPreviousOrder?: boolean;
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
  isHighlighted?: boolean;
  highlightColor?: string;
}

export interface MapBounds {
  points: Array<{
    lat: number;
    lng: number;
  }>;
}
