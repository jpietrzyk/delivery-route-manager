import type {
  MapProvider,
  RouteSegment,
} from "@/types/map-provider";
import type { Order } from "@/types/order";

/**
 * RouteManager - Provider-agnostic route management service
 * Handles creation, updating, and removal of route segments between orders
 */
export class RouteManager {
  private segments: Map<string, RouteSegment> = new Map();
  private calculationQueue: string[] = [];
  private isProcessing = false;
  private mapProvider: MapProvider;

  constructor(mapProvider: MapProvider) {
    this.mapProvider = mapProvider;
  }

  /**
   * Create a new route segment
   */
  private createNewSegment(
    segmentId: string,
    fromOrder: Order,
    toOrder: Order
  ): RouteSegment {
    return {
      id: segmentId,
      fromOrder,
      toOrder,
      routeData: undefined,
      mapRoute: undefined,
      status: "idle",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Update an existing route segment
   */
  private updateExistingSegment(
    segment: RouteSegment,
    fromOrder: Order,
    toOrder: Order
  ): RouteSegment {
    return {
      ...segment,
      fromOrder,
      toOrder,
      updatedAt: new Date(),
    };
  }

  /**
   * Calculate route for a segment using the map provider
   */
  private async calculateSegmentRoute(segment: RouteSegment): Promise<void> {
    try {
      segment.status = "calculating";
      this.segments.set(segment.id, segment);

      const routeData = await this.mapProvider.createRouteSegment(
        segment.fromOrder,
        segment.toOrder
      );

      // Remove old route if exists
      if (segment.mapRoute) {
        this.mapProvider.removeRouteSegment(segment.mapRoute.id);
      }

      // Draw new route
      const mapRoute = this.mapProvider.drawRouteSegment(routeData);
      if (!mapRoute) {
        throw new Error(`Map provider failed to draw route segment for ${segment.id}`);
      }
      mapRoute.segmentId = segment.id;

      // Update segment
      segment.routeData = {
        ...routeData,
        calculatedAt: new Date(),
        status: "calculated",
      };
      segment.mapRoute = mapRoute;
      segment.status = "calculated";
      segment.updatedAt = new Date();

      this.segments.set(segment.id, segment);
    } catch (error) {
      segment.status = "failed";
      segment.routeData = {
        polyline: [],
        distance: 0,
        duration: 0,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      segment.updatedAt = new Date();
      this.segments.set(segment.id, segment);
      console.error(`Failed to calculate route for segment ${segment.id}:`, error);
    }
  }

  /**
   * Process the calculation queue
   */
  private async processQueue(): Promise<void> {
    if (this.calculationQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;

    while (this.calculationQueue.length > 0) {
      const segmentId = this.calculationQueue.shift()!;
      const segment = this.segments.get(segmentId);

      if (segment) {
        await this.calculateSegmentRoute(segment);
      }
    }

    this.isProcessing = false;
  }

  /**
   * ============================================
   * Public API
   * ============================================
   */

  /**
   * Add or update a route segment
   * If the segment doesn't exist, it will be created
   * If it exists, it will be updated with new order data
   */
  upsertSegment(fromOrder: Order, toOrder: Order): RouteSegment {
    const segmentId = `${fromOrder.id}-${toOrder.id}`;
    let segment = this.segments.get(segmentId);

    if (!segment) {
      segment = this.createNewSegment(segmentId, fromOrder, toOrder);
    } else {
      segment = this.updateExistingSegment(segment, fromOrder, toOrder);
    }

    this.segments.set(segmentId, segment);

    // If route data doesn't exist, calculate it
    if (!segment.routeData && segment.status !== "calculating") {
      this.recalculateSegment(segmentId);
    }

    return segment;
  }

  /**
   * Queue a segment for recalculation
   * This will be processed asynchronously
   */
  async recalculateSegment(segmentId: string): Promise<RouteSegment> {
    // Avoid duplicate calculations
    if (this.calculationQueue.includes(segmentId)) {
      return this.segments.get(segmentId)!;
    }

    this.calculationQueue.push(segmentId);

    // Start processing if not already
    if (!this.isProcessing) {
      await this.processQueue();
    }

    return this.segments.get(segmentId)!;
  }

  /**
   * Remove a route segment
   */
  removeSegment(segmentId: string): void {
    const segment = this.segments.get(segmentId);

    if (segment) {
      // Remove from map if it exists
      if (segment.mapRoute) {
        this.mapProvider.removeRouteSegment(segment.mapRoute.id);
      }

      // Remove from segments map
      this.segments.delete(segmentId);

      // Remove from queue if it's there
      this.calculationQueue = this.calculationQueue.filter(
        (id) => id !== segmentId
      );
    }
  }

  /**
   * Get a specific route segment
   */
  getSegment(segmentId: string): RouteSegment | undefined {
    return this.segments.get(segmentId);
  }

  /**
   * Get all route segments
   */
  getAllSegments(): RouteSegment[] {
    return Array.from(this.segments.values());
  }

  /**
   * Check if a segment is currently being calculated
   */
  isCalculating(segmentId: string): boolean {
    const segment = this.segments.get(segmentId);
    return segment?.status === "calculating" || this.calculationQueue.includes(segmentId);
  }

  /**
   * Clear all route segments
   */
  clear(): void {
    // Remove all routes from map
    this.segments.forEach((segment) => {
      if (segment.mapRoute) {
        this.mapProvider.removeRouteSegment(segment.mapRoute.id);
      }
    });

    // Clear all data
    this.segments.clear();
    this.calculationQueue = [];
    this.isProcessing = false;
  }

  /**
   * Get the total number of segments
   */
  getSegmentCount(): number {
    return this.segments.size;
  }

  /**
   * Get the number of segments currently being calculated
   */
  getCalculatingCount(): number {
    return this.calculationQueue.length;
  }

  /**
   * Check if any segments are being processed
   */
  isProcessingQueue(): boolean {
    return this.isProcessing;
  }

  /**
   * Get segments by status
   */
  getSegmentsByStatus(status: RouteSegment["status"]): RouteSegment[] {
    return Array.from(this.segments.values()).filter(
      (segment) => segment.status === status
    );
  }

  /**
   * Highlight a specific route segment
   */
  highlightSegment(segmentId: string): void {
    const segment = this.segments.get(segmentId);
    console.log(`Highlighting segment: ${segmentId}`, { segment, hasMapRoute: !!segment?.mapRoute });

    if (segment && segment.mapRoute) {
      // Store original style
      if (!segment.mapRoute.originalStyle) {
        segment.mapRoute.originalStyle = {
          color: segment.mapRoute.color,
          weight: segment.mapRoute.weight,
          opacity: segment.mapRoute.opacity,
        };
      }

      // Apply highlight style
      segment.mapRoute.color = "#ef4444"; // Red color for highlight
      segment.mapRoute.weight = 6;
      segment.mapRoute.opacity = 1.0;

      // Update the route on the map
      if (this.mapProvider.updateRouteSegment) {
        console.log(`Updating route style for segment: ${segmentId}`);
        this.mapProvider.updateRouteSegment(segment.mapRoute, {
          ...segment.routeData!,
          color: segment.mapRoute.color,
          weight: segment.mapRoute.weight,
          opacity: segment.mapRoute.opacity,
        });
      }
    }
  }

  /**
   * Highlight a specific route segment by ID (more flexible version)
   */
  highlightSegmentById(segmentId: string): void {
    const segment = this.segments.get(segmentId);
    if (segment && segment.mapRoute) {
      this.highlightSegment(segmentId);
    }
  }

  /**
   * Remove highlight from a specific route segment
   */
  unhighlightSegment(segmentId: string): void {
    const segment = this.segments.get(segmentId);
    console.log(`Unhighlighting segment: ${segmentId}`, { segment, hasOriginalStyle: !!segment?.mapRoute?.originalStyle });

    if (segment && segment.mapRoute && segment.mapRoute.originalStyle) {
      // Restore original style
      segment.mapRoute.color = segment.mapRoute.originalStyle.color;
      segment.mapRoute.weight = segment.mapRoute.originalStyle.weight;
      segment.mapRoute.opacity = segment.mapRoute.originalStyle.opacity;

      // Update the route on the map
      if (this.mapProvider.updateRouteSegment) {
        console.log(`Restoring route style for segment: ${segmentId}`);
        this.mapProvider.updateRouteSegment(segment.mapRoute, {
          ...segment.routeData!,
          color: segment.mapRoute.color,
          weight: segment.mapRoute.weight,
          opacity: segment.mapRoute.opacity,
        });
      }

      // Clean up
      delete segment.mapRoute.originalStyle;
    }
  }
}
