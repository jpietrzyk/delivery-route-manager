/* eslint-disable @typescript-eslint/no-explicit-any */
import L from "leaflet";
import type {
  MapProvider,
  MapMarker,
  MapRoute,
  RouteData,
  BoundingBox,
  LatLng,
} from "@/types/map-provider";
import type { Order } from "@/types/order";

/**
 * Leaflet Map Provider - Implementation of MapProvider interface for Leaflet
 * This wraps all Leaflet-specific functionality behind the provider-agnostic interface
 */
export class LeafletMapProvider implements MapProvider {
  private map: unknown;
  private markers: Map<string, unknown> = new Map();
  private routes: Map<string, unknown> = new Map();
  private markerIcons: Map<string, unknown> = new Map();

  // Highlight callback for marker hover events
  private onMarkerHoverCallback?: (markerId: string, isHovering: boolean) => void;

  constructor(map: any) {
    this.map = map;
    this.initializeIcons();
  }

  /**
   * Initialize all marker icons
   */
  private initializeIcons(): void {
    // Default icon (blue) - for delivery orders
    this.markerIcons.set("default", L.icon({
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
    }));

    // Pool icon (grey) - for unassigned orders
    this.markerIcons.set("pool", L.icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
    }));

    // Highlight icon (red) - for hovered/selected orders
    this.markerIcons.set("highlight", L.icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
    }));

    // High-value icon (orange) - for high-value pool orders
    this.markerIcons.set("high-value", L.icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
    }));
  }

  /**
   * Get the appropriate icon for an order based on its properties
   */
  private getIconForOrder(order: Order): any {
    const isPool = !order.deliveryId;
    const ORANGE_THRESHOLD = 13000;

    if (isPool) {
      return (order.totalAmount ?? 0) > ORANGE_THRESHOLD
        ? this.markerIcons.get("high-value")!
        : this.markerIcons.get("pool")!;
    }
    return this.markerIcons.get("default")!;
  }

  /**
   * Calculate distance between two points in meters (Haversine formula)
   */
  private calculateDistance(point1: LatLng, point2: LatLng): number {
    const R = 6371000; // Earth radius in meters
    const φ1 = (point1.lat * Math.PI) / 180;
    const φ2 = (point2.lat * Math.PI) / 180;
    const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
    const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Estimate driving duration based on distance (simple estimation)
   */
  private estimateDuration(distance: number): number {
    // Average driving speed: 30 km/h = 8.333 m/s
    const drivingSpeed = 8.333;
    return distance / drivingSpeed;
  }

  /**
   * Calculate bounding box for a route
   */
  private calculateBounds(point1: LatLng, point2: LatLng): BoundingBox {
    return {
      minLat: Math.min(point1.lat, point2.lat),
      minLng: Math.min(point1.lng, point2.lng),
      maxLat: Math.max(point1.lat, point2.lat),
      maxLng: Math.max(point1.lng, point2.lng),
    };
  }

  /**
   * ============================================
   * MapProvider Interface Implementation
   * ============================================
   */

  /**
   * Create a marker for an order
   */
  createMarker(order: Order): MapMarker {
    const icon = this.getIconForOrder(order);
    const marker = L.marker([order.location.lat, order.location.lng], { icon });

    // Add hover event handlers
    marker.on("mouseover", () => {
      this.onMarkerHoverCallback?.(order.id, true);
    });

    marker.on("mouseout", () => {
      this.onMarkerHoverCallback?.(order.id, false);
    });

    marker.addTo(this.map);
    this.markers.set(order.id, marker);

    return {
      id: `marker-${order.id}`,
      orderId: order.id,
      nativeMarker: marker,
      iconType: this.getIconForOrder(order) === this.markerIcons.get("highlight")
        ? "highlight"
        : this.getIconForOrder(order) === this.markerIcons.get("pool")
        ? "pool"
        : this.getIconForOrder(order) === this.markerIcons.get("high-value")
        ? "high-value"
        : "default",
    };
  }

  /**
   * Update an existing marker
   */
  updateMarker(marker: MapMarker, order: Order): void {
    const leafletMarker = this.markers.get(order.id) as any;
    if (!leafletMarker) return;

    // Update position
    leafletMarker.setLatLng([order.location.lat, order.location.lng]);

    // Update icon based on order properties
    const newIcon = this.getIconForOrder(order);
    leafletMarker.setIcon(newIcon);

    // Update marker data
    marker.iconType =
      newIcon === this.markerIcons.get("highlight")
        ? "highlight"
        : newIcon === this.markerIcons.get("pool")
        ? "pool"
        : newIcon === this.markerIcons.get("high-value")
        ? "high-value"
        : "default";
  }

  /**
   * Remove a marker
   */
  removeMarker(markerId: string): void {
    const orderId = markerId.replace("marker-", "");
    const marker = this.markers.get(orderId) as any;
    if (marker) {
      (this.map as any).removeLayer(marker);
      this.markers.delete(orderId);
    }
  }

  /**
   * Create route data between two orders (Leaflet uses simple straight lines)
   */
  async createRouteSegment(from: Order, to: Order): Promise<RouteData> {
    const distance = this.calculateDistance(from.location, to.location);
    const duration = this.estimateDuration(distance);

    return {
      polyline: [
        [from.location.lat, from.location.lng],
        [to.location.lat, to.location.lng],
      ],
      distance,
      duration,
      bounds: this.calculateBounds(from.location, to.location),
      status: "calculated",
      calculatedAt: new Date(),
    };
  }

  /**
   * Draw a route segment on the map
   */
  drawRouteSegment(routeData: RouteData): MapRoute {
    const polyline = L.polyline(routeData.polyline as number[][], {
      color: "#2563eb",
      weight: 4,
      opacity: 0.8,
    });

    polyline.addTo(this.map);
    const routeId = `route-${Date.now()}`;
    this.routes.set(routeId, polyline);

    return {
      id: routeId,
      segmentId: "", // Will be set by RouteManager
      nativeRoute: polyline,
      color: "#2563eb",
      weight: 4,
      opacity: 0.8,
    };
  }

  /**
   * Update an existing route segment
   */
  updateRouteSegment(route: MapRoute, routeData: RouteData): void {
    const leafletRoute = this.routes.get(route.id) as any;
    if (!leafletRoute) return;

    // Update polyline
    leafletRoute.setLatLngs(routeData.polyline as number[][]);

    // Update visual properties if provided
    if ((routeData as any).color) {
      leafletRoute.setStyle({ color: (routeData as any).color });
    }
  }

  /**
   * Remove a route segment
   */
  removeRouteSegment(routeId: string): void {
    const route = this.routes.get(routeId) as any;
    if (route) {
      (this.map as any).removeLayer(route);
      this.routes.delete(routeId);
    }
  }

  /**
   * Fit map bounds to show all orders
   */
  fitBounds(orders: Order[]): void {
    if (orders.length === 0) return;

    const bounds = (L as any).latLngBounds(
      orders.map((order) => [order.location.lat, order.location.lng])
    );
    (this.map as any).fitBounds(bounds, { padding: [40, 40] });
  }

  /**
   * Set map view to specific location and zoom
   */
  setView(location: LatLng, zoom: number): void {
    (this.map as any).setView([location.lat, location.lng], zoom);
  }

  /**
   * Set callback for marker hover events
   */
  onMarkerHover: ((markerId: string, isHovering: boolean) => void) | undefined;

  /**
   * Clean up all markers and routes
   */
  clear(): void {
    // Remove all markers
    this.markers.forEach((marker) => {
      (this.map as any).removeLayer(marker);
    });
    this.markers.clear();

    // Remove all routes
    this.routes.forEach((route) => {
      (this.map as any).removeLayer(route);
    });
    this.routes.clear();
  }
}
