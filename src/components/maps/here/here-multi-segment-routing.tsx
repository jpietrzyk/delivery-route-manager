// src/components/HereMultiSegmentRouting.tsx
import React, { useEffect, useRef } from "react";
import { useHereMap } from "@/hooks/use-here-map";
import { useOrderRoute } from "@/hooks/use-order-route";
import type { MapGroup, RoutingResult, RoutingError } from "@/types/here-maps";

const HereMultiSegmentRouting: React.FC = () => {
  const { isReady, mapRef } = useHereMap();
  const orderRoute = useOrderRoute();
  const routeGroupRef = useRef<MapGroup | null>(null);

  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    type Order = { name: string; location: { lat: number; lng: number } };
    const routeOrders =
      (orderRoute as { routeOrders?: Order[] })?.routeOrders ?? [];

    const H = window.H;
    if (!H || !H.service) {
      console.error("HERE Maps SDK not available");
      return;
    }

    // Use the current route orders from context
    const sortedOrders = [...routeOrders];

    if (sortedOrders.length < 2) {
      console.warn("Need at least 2 orders to create a route");
      return;
    }

    console.log("Creating multi-segment route:");
    sortedOrders.forEach((order, index) => {
      console.log(
        `${index + 1}. ${order.name} (${order.location.lat}, ${
          order.location.lng
        })`
      );
    });

    // Create platform and get routing service
    const platform = new H.service.Platform({
      apikey: import.meta.env.VITE_HERE_MAPS_API_KEY,
    });
    const routingService = platform.getRoutingService();

    const routeGroup = new H.map.Group();
    routeGroupRef.current = routeGroup;

    // Create route segments between consecutive points
    const createRouteSegments = async () => {
      for (let i = 0; i < sortedOrders.length - 1; i++) {
        const startPoint = sortedOrders[i];
        const endPoint = sortedOrders[i + 1];

        console.log(
          `Creating segment ${i + 1}: ${startPoint.name} → ${endPoint.name}`
        );

        const segmentParams = {
          transportMode: "car",
          origin: `${startPoint.location.lat},${startPoint.location.lng}`,
          destination: `${endPoint.location.lat},${endPoint.location.lng}`,
          routingMode: "fast",
          return: ["polyline", "summary"],
        };

        try {
          await new Promise<void>((resolve) => {
            routingService.calculateRoute(
              segmentParams,
              // Success callback
              (result: RoutingResult) => {
                console.log(`Segment ${i + 1} result:`, result);

                if (result.routes && result.routes.length > 0) {
                  const route = result.routes[0];

                  try {
                    if (H.geo.LineString.fromFlexiblePolyline) {
                      const routeLineString =
                        H.geo.LineString.fromFlexiblePolyline(
                          route.sections[0].polyline
                        );
                      const routePolyline = new H.map.Polyline(
                        routeLineString,
                        {
                          style: {
                            strokeColor: "#4285f4",
                            lineWidth: 6,
                          },
                        }
                      );
                      routeGroup.addObject(routePolyline);
                      console.log(`Segment ${i + 1} added successfully`);
                    } else {
                      throw new Error("fromFlexiblePolyline not available");
                    }
                  } catch (segmentError) {
                    console.warn(
                      `API failed for segment ${i + 1}, using fallback:`,
                      segmentError
                    );

                    // Fallback: create simple line for this segment
                    const lineString = new H.geo.LineString();
                    lineString.pushPoint(
                      startPoint.location.lat,
                      startPoint.location.lng
                    );
                    lineString.pushPoint(
                      endPoint.location.lat,
                      endPoint.location.lng
                    );

                    const segmentPolyline = new H.map.Polyline(lineString, {
                      style: {
                        strokeColor: "#ff9800",
                        lineWidth: 4,
                        lineDash: [5, 5],
                      },
                    });
                    routeGroup.addObject(segmentPolyline);
                    console.log(`Segment ${i + 1} fallback added`);
                  }
                } else {
                  console.warn(`No route found for segment ${i + 1}`);

                  // Create fallback line
                  const lineString = new H.geo.LineString();
                  lineString.pushPoint(
                    startPoint.location.lat,
                    startPoint.location.lng
                  );
                  lineString.pushPoint(
                    endPoint.location.lat,
                    endPoint.location.lng
                  );

                  const segmentPolyline = new H.map.Polyline(lineString, {
                    style: {
                      strokeColor: "#ff4444",
                      lineWidth: 3,
                      lineDash: [2, 2],
                    },
                  });
                  routeGroup.addObject(segmentPolyline);
                }
                resolve();
              },
              // Error callback
              (error: RoutingError) => {
                console.error(`Segment ${i + 1} routing failed:`, error);

                // Fallback: create simple line for this segment
                try {
                  const lineString = new H.geo.LineString();
                  lineString.pushPoint(
                    startPoint.location.lat,
                    startPoint.location.lng
                  );
                  lineString.pushPoint(
                    endPoint.location.lat,
                    endPoint.location.lng
                  );

                  const segmentPolyline = new H.map.Polyline(lineString, {
                    style: {
                      strokeColor: "#ff4444",
                      lineWidth: 3,
                      lineDash: [2, 2],
                    },
                  });
                  routeGroup.addObject(segmentPolyline);
                  console.log(`Segment ${i + 1} error fallback added`);
                } catch (fallbackError) {
                  console.error(
                    `Fallback segment ${i + 1} failed:`,
                    fallbackError
                  );
                }
                resolve();
              }
            );
          });
        } catch (segmentError) {
          console.error(`Error processing segment ${i + 1}:`, segmentError);
        }
      }

      // Add markers for all points
      const createMarker = (
        lat: number,
        lng: number,
        color: string,
        label?: string
      ) => {
        const marker = new H.map.Marker({ lat, lng });

        if (label) {
          // Add label as SVG icon
          const svgMarkup = `<div style="background:${color};color:white;padding:2px 4px;border-radius:3px;font-size:10px;font-weight:bold;">${label}</div>`;
          const icon = new H.map.Icon(svgMarkup);
          marker.setIcon(icon);
        }

        return marker;
      };

      // Add markers for all points
      sortedOrders.forEach((order, index) => {
        let color = "#2196F3"; // Blue for waypoints
        let label = `${index + 1}`;

        if (index === 0) {
          color = "#4CAF50"; // Green for origin
          label = "O";
        } else if (index === sortedOrders.length - 1) {
          color = "#F44336"; // Red for destination
          label = "D";
        }

        const marker = createMarker(
          order.location.lat,
          order.location.lng,
          color,
          label
        );
        routeGroup.addObject(marker);
      });

      // Add route group to map
      if (mapRef.current) {
        mapRef.current.addObject(routeGroup);

        // Don't auto-zoom to fit route - preserve user's zoom level
        // The initial zoom is set when markers are first loaded
      }

      console.log("Multi-segment route completed successfully");
    };

    createRouteSegments();

    // Cleanup function
    const currentMap = mapRef.current;
    const currentRouteGroup = routeGroupRef.current;
    return () => {
      try {
        if (currentMap && currentRouteGroup) {
          currentMap.removeObject(currentRouteGroup);
        }
      } catch (error) {
        console.warn("Error during route cleanup:", error);
      }
      routeGroupRef.current = null;
    };
  }, [isReady, mapRef, orderRoute]);

  return null; // This component doesn't render anything visible
};

export default HereMultiSegmentRouting;
