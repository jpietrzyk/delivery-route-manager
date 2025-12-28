import type { Order } from "./order";

// Re-export Order for use in map provider implementations
export type { Order };

/**
 * Map Provider Interface - Abstracts map-specific operations
 * All map providers (Leaflet, HERE Maps, Google Maps) must implement this interface
 */
export interface MapProvider {
  /**
   * Marker Operations
   */
  createMarker(order: Order): MapMarker;
  updateMarker(marker: MapMarker, order: Order): void;
  removeMarker(markerId: string): void;

  /**
   * Route Operations
   */
  createRouteSegment(from: Order, to: Order): Promise<RouteData>;
  drawRouteSegment(routeData: RouteData): MapRoute;
  updateRouteSegment(route: MapRoute, routeData: RouteData): void;
  removeRouteSegment(routeId: string): void;

  /**
   * Map View Operations
   */
  fitBounds(orders: Order[]): void;
  setView(location: LatLng, zoom: number): void;

  /**
   * Event Handling
   */
  onMarkerHover?: (markerId: string, isHovering: boolean) => void;
}

/**
 * Map Marker - Provider-agnostic marker representation
 */
export interface MapMarker {
  id: string;
  orderId: string;
  // Provider-specific data can be stored here
  nativeMarker?: unknown;

  /**
   * Visual properties that should be consistent across providers
   */
  isHighlighted?: boolean;
  iconType?: 'default' | 'pool' | 'highlight' | 'high-value';
}

/**
 * Map Route - Provider-agnostic route representation
 */
export interface MapRoute {
  id: string;
  segmentId: string; // "fromOrderId-toOrderId"
  // Provider-specific data can be stored here
  nativeRoute?: unknown;

  /**
   * Visual properties that should be consistent across providers
   */
  color?: string;
  weight?: number;
  opacity?: number;

  /**
   * Original style for highlighting functionality
   */
  originalStyle?: {
    color?: string;
    weight?: number;
    opacity?: number;
  };
}

/**
 * Route Data - Provider-agnostic route calculation results
 * The polyline format is flexible to accommodate different provider formats
 */
export interface RouteData {
  /**
   * Polyline representation - can be:
   * - Encoded polyline string (Google/HERE format)
   * - Array of [lat, lng] coordinates (Leaflet format)
   * - Provider-specific format
   */
  polyline: string | number[][] | Record<string, unknown>;

  /**
   * Distance in meters
   */
  distance: number;

  /**
   * Duration in seconds
   */
  duration: number;

  /**
   * Bounding box of the route
   */
  bounds?: BoundingBox;

  /**
   * Calculation status
   */
  status?: 'calculated' | 'calculating' | 'failed';

  /**
   * Error information if calculation failed
   */
  error?: string;

  /**
   * Timestamp of calculation
   */
  calculatedAt?: Date;

  /**
   * Optional styling properties for route highlighting
   */
  color?: string;
  weight?: number;
  opacity?: number;
}

/**
 * Bounding Box - Geographic bounds
 */
export interface BoundingBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

/**
 * Latitude/Longitude coordinates
 */
export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Route Segment - Logical representation of a route between two orders
 * This is used by the RouteManager and is completely provider-agnostic
 */
export interface RouteSegment {
  id: string; // "fromOrderId-toOrderId"
  fromOrder: Order;
  toOrder: Order;
  routeData?: RouteData;
  mapRoute?: MapRoute;
  status: 'idle' | 'calculating' | 'calculated' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  duration?: number; // Duration in seconds (optional)
}
