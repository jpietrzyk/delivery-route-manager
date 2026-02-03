/**
 * HERE Maps Routing API Service
 * Documentation: https://developer.here.com/documentation/routing-api/dev_guide/index.html
 */

export interface HereRoutingRequest {
  start: {
    lat: number;
    lng: number;
  };
  end: {
    lat: number;
    lng: number;
  };
  waypoints?: Array<{
    lat: number;
    lng: number;
  }>;
  routeType?: 'fastest' | 'shortest' | 'balanced';
  vehicle?: 'car' | 'truck' | 'pedestrian' | 'bicycle' | 'taxi' | 'bus';
}

export interface HereRoutingResponse {
  routes: Array<{
    id: string;
    sections: Array<{
      id: string;
      type: string;
      departure: {
        place: {
          type: string;
          location: {
            lat: number;
            lng: number;
          };
        };
        time: string;
      };
      arrival: {
        place: {
          type: string;
          location: {
            lat: number;
            lng: number;
          };
        };
        time: string;
      };
      summary: {
        length: number; // meters
        baseDuration: number; // seconds
        duration: number; // seconds (includes traffic)
      };
      polyline: string; // Encoded polyline (FlexiblePolyline format)
      spans?: Array<{
        offset: number;
        names: Array<{ value: string }>;
      }>;
    }>;
    sections_summary?: {
      length: number;
      baseDuration: number;
      duration: number;
    };
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

class HereRoutingApiClass {
  private readonly baseUrl = 'https://router.hereapi.com/v8/routes';

  /**
   * Calculate a route between two points
   */
  async calculateRoute(
    request: HereRoutingRequest,
    apiKey: string
  ): Promise<HereRoutingResponse> {
    const url = new URL(this.baseUrl);

    // Add API key
    url.searchParams.set('apiKey', apiKey);

    // Add start coordinates
    url.searchParams.set('origin', `${request.start.lat},${request.start.lng}`);

    // Add end coordinates
    url.searchParams.set('destination', `${request.end.lat},${request.end.lng}`);

    // Add waypoints if provided
    if (request.waypoints && request.waypoints.length > 0) {
      const waypointsStr = request.waypoints
        .map((wp) => `${wp.lat},${wp.lng}`)
        .join(';');
      url.searchParams.set('via', waypointsStr);
    }

    // Add transport mode (car, truck, pedestrian, bicycle, etc.)
    const vehicle = request.vehicle || 'car';
    url.searchParams.set('transportMode', vehicle);

    // Request return format: polyline to get the route geometry and summary for distance/duration
    // Valid return types: polyline, summary (spans is not supported in v8)
    url.searchParams.set('return', 'polyline,summary');

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Failed to calculate route: ${response.status} ${response.statusText}. ${errorData}`
      );
    }

    return response.json();
  }

  /**
   * Decode HERE Flexible Polyline format to coordinates
   * https://github.com/heremaps/flexible-polyline/
   * Format: Encoded unsigned varints with header containing version, precision,
   * and optional third dimension.
   */
  decodeFlexiblePolyline(
    encoded: string
  ): Array<{ lat: number; lng: number }> {
    if (!encoded || encoded.length === 0) {
      return [];
    }

    const encodingTable =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    const decodingTable: number[] = new Array(128).fill(-1);
    for (let i = 0; i < encodingTable.length; i++) {
      decodingTable[encodingTable.charCodeAt(i)] = i;
    }

    const decodeUnsignedValues = (input: string): number[] => {
      let result = 0;
      let shift = 0;
      const values: number[] = [];

      for (const char of input) {
        const charCode = char.charCodeAt(0);
        const value = decodingTable[charCode];
        if (value < 0) {
          throw new Error("Invalid flexible polyline character");
        }

        result |= (value & 0x1f) << shift;

        if ((value & 0x20) === 0) {
          values.push(result);
          result = 0;
          shift = 0;
        } else {
          shift += 5;
        }
      }

      if (shift > 0) {
        throw new Error("Invalid flexible polyline encoding");
      }

      return values;
    };

    const toSigned = (val: number): number => {
      let res = val;
      if (res & 1) {
        res = ~res;
      }
      res >>= 1;
      return res;
    };

    const decoder = decodeUnsignedValues(encoded);
    if (decoder.length < 2) {
      return [];
    }

    const version = decoder[0];
    if (version !== 1) {
      return [];
    }

    const header = decoder[1];
    const precision = header & 15;
    const thirdDim = (header >> 4) & 7;

    const factorDegree = Math.pow(10, precision);

    let lastLat = 0;
    let lastLng = 0;

    const coordinates: Array<{ lat: number; lng: number }> = [];
    let i = 2;
    while (i < decoder.length) {
      const deltaLat = toSigned(decoder[i]);
      const deltaLng = toSigned(decoder[i + 1]);
      lastLat += deltaLat;
      lastLng += deltaLng;

      if (thirdDim) {
        // Z dimension is present but not used
        i += 3;
      } else {
        i += 2;
      }

      coordinates.push({
        lat: lastLat / factorDegree,
        lng: lastLng / factorDegree,
      });
    }

    return coordinates;
  }

  private normalizePositions(
    positions: Array<{ lat: number; lng: number }>,
    from: { lat: number; lng: number },
    to: { lat: number; lng: number },
  ): Array<{ lat: number; lng: number }> {
    if (positions.length === 0) {
      return positions;
    }

    const distanceScore = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) =>
      Math.abs(a.lat - b.lat) + Math.abs(a.lng - b.lng);

    const start = positions[0];
    const end = positions[positions.length - 1];
    const directScore = distanceScore(start, from) + distanceScore(end, to);

    const swapped = positions.map((pos) => ({ lat: pos.lng, lng: pos.lat }));
    const swappedStart = swapped[0];
    const swappedEnd = swapped[swapped.length - 1];
    const swappedScore =
      distanceScore(swappedStart, from) + distanceScore(swappedEnd, to);

    if (swappedScore < directScore) {
      return swapped;
    }

    return positions;
  }

  /**
   * Calculate route segments for multiple consecutive waypoints
   * Calculates separate routes between each pair of consecutive waypoints
   */
  async calculateRouteSegments(
    waypoints: Array<{ lat: number; lng: number }>,
    apiKey: string,
    options?: {
      routeType?: HereRoutingRequest['routeType'];
      vehicle?: HereRoutingRequest['vehicle'];
    }
  ): Promise<RouteSegment[]> {
    if (waypoints.length < 2) {
      return [];
    }

    const segments: RouteSegment[] = [];

    // Calculate a separate route for each consecutive pair of waypoints
    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];

      try {
        const routeResponse = await this.calculateRoute(
          {
            start: from,
            end: to,
            routeType: options?.routeType || 'fastest',
            vehicle: options?.vehicle || 'car',
          },
          apiKey
        );

        if (!routeResponse.routes || routeResponse.routes.length === 0) {
          console.warn(`No route found for segment ${i}`);
          // Create a fallback straight-line segment
          const segmentId = `${from.lat},${from.lng}-${to.lat},${to.lng}`;
          segments.push({
            id: segmentId,
            from: { lat: from.lat, lng: from.lng },
            to: { lat: to.lat, lng: to.lng },
            positions: [
              { lat: from.lat, lng: from.lng },
              { lat: to.lat, lng: to.lng },
            ],
          });
          continue;
        }

        const route = routeResponse.routes[0];
        const section = route.sections[0];

        // Decode polyline
        const positions = this.normalizePositions(
          this.decodeFlexiblePolyline(section.polyline),
          from,
          to,
        );

        const segmentId = `${from.lat},${from.lng}-${to.lat},${to.lng}`;
        const segment: RouteSegment = {
          id: segmentId,
          from: { lat: from.lat, lng: from.lng },
          to: { lat: to.lat, lng: to.lng },
          positions: positions.length > 1 ? positions : [
            { lat: from.lat, lng: from.lng },
            { lat: to.lat, lng: to.lng },
          ],
          distance: section.summary.length,
          duration: section.summary.duration,
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
          positions: [
            { lat: from.lat, lng: from.lng },
            { lat: to.lat, lng: to.lng },
          ],
        });
      }
    }

    return segments;
  }

  /**
   * Clear the route cache if needed
   */
  clearCache(): void {
    // Could implement caching if needed
  }
}

export const HereRoutingApi = new HereRoutingApiClass();
