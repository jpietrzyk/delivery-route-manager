/**
 * Mapy.cz Routing API Service
 * Documentation: https://github.com/mapycom/developer/blob/master/docs/rest-api/routing.md
 */

export interface RoutingRequest {
  start: [number, number]; // [longitude, latitude]
  end: [number, number]; // [longitude, latitude]
  waypoints?: Array<[number, number]>; // Optional waypoints
  routeType?: 'car_fast' | 'car_fast_traffic' | 'car_short' | 'foot_fast' | 'foot_hiking' | 'bike_road' | 'bike_mountain';
  format?: 'geojson' | 'polyline' | 'polyline6';
  avoidToll?: boolean;
  avoidHighways?: boolean;
  departure?: string; // ISO-8601 format
  lang?: string;
}

export interface RoutingResponse {
  length: number; // Route length in meters
  duration: number; // Route duration in seconds
  geometry: {
    type: 'Feature';
    geometry: {
      type: 'LineString';
      coordinates: Array<[number, number]>; // [longitude, latitude]
    };
    properties: Record<string, unknown>;
  };
  parts?: Array<{
    length: number;
    duration: number;
  }>;
  routePoints?: Array<{
    originalPosition: [number, number];
    mappedPosition: [number, number];
    snapDistance: number;
    restricted: boolean;
    restrictionType?: string;
  }>;
}

export interface RouteSegment {
  id: string;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  positions?: Array<{ lat: number; lng: number }>; // Full polyline path
  distance?: number; // meters
  duration?: number; // seconds
}

class MapyRoutingApiClass {
  private readonly baseUrl = 'https://api.mapy.com/v1/routing/route';
  private routeCache = new Map<string, RouteSegment>();

  /**
   * Calculate a route between two points
   */
  async calculateRoute(
    request: RoutingRequest,
    apiKey: string
  ): Promise<RoutingResponse> {
    const url = new URL(this.baseUrl);

    // Add API key
    url.searchParams.set('apikey', apiKey);

    // Add start and end coordinates (longitude, latitude)
    url.searchParams.set('start', request.start.join(','));
    url.searchParams.set('end', request.end.join(','));

    // Add route type
    url.searchParams.set('routeType', request.routeType || 'car_fast');

    // Add format
    url.searchParams.set('format', request.format || 'geojson');

    // Add optional waypoints
    if (request.waypoints && request.waypoints.length > 0) {
      const waypointsStr = request.waypoints.map(wp => wp.join(',')).join(';');
      url.searchParams.set('waypoints', waypointsStr);
    }

    // Add optional parameters
    if (request.avoidToll !== undefined) {
      url.searchParams.set('avoidToll', String(request.avoidToll));
    }
    if (request.avoidHighways !== undefined) {
      url.searchParams.set('avoidHighways', String(request.avoidHighways));
    }
    if (request.departure) {
      url.searchParams.set('departure', request.departure);
    }
    if (request.lang) {
      url.searchParams.set('lang', request.lang);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to calculate route: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
      );
    }

    return response.json();
  }

  /**
   * Calculate route segments for multiple consecutive waypoints
   * Calculates separate routes between each pair of consecutive waypoints
   * This ensures each segment is optimized independently without being affected by the chaotic ordering of all waypoints
   */
  async calculateRouteSegments(
    waypoints: Array<{ lat: number; lng: number }>,
    apiKey: string,
    options?: {
      routeType?: RoutingRequest['routeType'];
      avoidToll?: boolean;
      avoidHighways?: boolean;
    }
  ): Promise<RouteSegment[]> {
    if (waypoints.length < 2) {
      return [];
    }

    const segments: RouteSegment[] = [];

    // Calculate a separate route for each consecutive pair of waypoints
    // Route 1: waypoint[0] -> waypoint[1]
    // Route 2: waypoint[1] -> waypoint[2]
    // etc.
    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];

      try {
        const routeResponse = await this.calculateRoute(
          {
            start: [from.lng, from.lat],
            end: [to.lng, to.lat],
            routeType: options?.routeType || 'car_fast',
            format: 'geojson',
            avoidToll: options?.avoidToll,
            avoidHighways: options?.avoidHighways,
          },
          apiKey
        );

        console.log(`Segment ${i} (${from.lat},${from.lng} -> ${to.lat},${to.lng}):`, {
          distance: routeResponse.length,
          duration: routeResponse.duration,
          coordinatesCount: routeResponse.geometry.geometry.coordinates.length,
        });

        // Convert the polyline to positions
        const positions = this.convertGeoJSONToPositions(
          routeResponse.geometry.geometry.coordinates
        );

        const segmentId = `${from.lat},${from.lng}-${to.lat},${to.lng}`;
        const segment: RouteSegment = {
          id: segmentId,
          from: { lat: from.lat, lng: from.lng },
          to: { lat: to.lat, lng: to.lng },
          positions: positions.length > 1 ? positions : [{ lat: from.lat, lng: from.lng }, { lat: to.lat, lng: to.lng }],
          distance: routeResponse.length,
          duration: routeResponse.duration,
        };

        segments.push(segment);
      } catch (error) {
        console.error(`Failed to calculate route segment ${i}:`, error);
        // Create a fallback straight-line segment
        const segmentId = `${from.lat},${from.lng}-${to.lat},${to.lng}`;
        segments.push({
          id: segmentId,
          from: { lat: from.lat, lng: from.lng },
          to: { lat: to.lat, lng: to.lng },
          positions: [{ lat: from.lat, lng: from.lng }, { lat: to.lat, lng: to.lng }],
        });
      }
    }

    return segments;
  }

  /**
   * Clear the route cache
   */
  clearCache(): void {
    this.routeCache.clear();
  }

  /**
   * Convert GeoJSON LineString coordinates from [lng, lat] to [{lat, lng}]
   */
  convertGeoJSONToPositions(
    coordinates: Array<[number, number]>
  ): Array<{ lat: number; lng: number }> {
    return coordinates.map(([lng, lat]) => ({ lat, lng }));
  }
}

export const MapyRoutingApi = new MapyRoutingApiClass();
