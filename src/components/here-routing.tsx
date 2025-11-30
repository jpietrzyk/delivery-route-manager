// src/components/HereRouting.tsx
import React, { useEffect, useRef } from "react";
import { useHereMap } from "@/hooks/useHereMap";
import { sampleOrders } from "@/types/order";

const HereRouting: React.FC = () => {
  const { isReady, mapRef } = useHereMap();
  const routeGroupRef = useRef<any>(null);

  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const H = (window as any).H;
    if (!H || !H.service) {
      console.error("HERE Maps SDK not available");
      return;
    }

    // Sort orders by creation date to create a logical route
    const sortedOrders = [...sampleOrders].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    if (sortedOrders.length < 2) {
      console.warn("Need at least 2 orders to create a route");
      return;
    }

    // Create waypoints: first is origin, last is destination, rest are waypoints
    const origin = sortedOrders[0];
    const destination = sortedOrders[sortedOrders.length - 1];
    const waypoints = sortedOrders.slice(1, -1);

    console.log("Creating route with waypoints:");
    console.log(
      "- Origin:",
      origin.name,
      `(${origin.location.lat}, ${origin.location.lng})`
    );
    console.log(
      "- Waypoints:",
      waypoints.map((w) => w.name)
    );
    console.log(
      "- Destination:",
      destination.name,
      `(${destination.location.lat}, ${destination.location.lng})`
    );

    // Create routing parameters for HERE Routing API
    const routeRequestParams = {
      transportMode: "car",
      origin: `${origin.location.lat},${origin.location.lng}`,
      destination: `${destination.location.lat},${destination.location.lng}`,
      vias: waypoints.map((order) => ({
        lat: order.location.lat,
        lng: order.location.lng,
      })),
      routingMode: "fast",
      return: ["polyline", "summary"],
    };

    console.log("Routing request params:", routeRequestParams);

    // Create platform and get routing service
    const platform = new H.service.Platform({
      apikey: import.meta.env.VITE_HERE_MAPS_API_KEY,
    });

    // Make routing request using HERE Routing API v8
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const routingService = platform.getRoutingService(null, 8);

    routingService.calculateRoute(
      routeRequestParams,
      // Success callback
      (result: any) => {
        console.log("Routing result:", result);

        if (result.routes && result.routes.length > 0) {
          const route = result.routes[0];
          const routeGroup = new H.map.Group();
          routeGroupRef.current = routeGroup;

          // Create route polyline from flexible polyline
          let routePolyline;
          try {
            // Check if fromFlexiblePolyline method exists
            if (H.geo.LineString.fromFlexiblePolyline) {
              const routeLineString = H.geo.LineString.fromFlexiblePolyline(
                route.sections[0].polyline
              );
              routePolyline = new H.map.Polyline(routeLineString, {
                style: {
                  strokeColor: "#4285f4",
                  lineWidth: 6,
                },
              });
            } else {
              // Fallback: create simple line between points
              console.warn(
                "fromFlexiblePolyline not available, creating simple line"
              );
              const lineString = new H.geo.LineString();

              // Add all points in sequence
              [origin, ...waypoints, destination].forEach((order) => {
                lineString.pushPoint(order.location.lat, order.location.lng);
              });

              routePolyline = new H.map.Polyline(lineString, {
                style: {
                  strokeColor: "#4285f4",
                  lineWidth: 6,
                },
              });
            }
          } catch (polylineError) {
            console.error("Error creating polyline:", polylineError);
            return;
          }

          routeGroup.addObject(routePolyline);

          routeGroup.addObject(routePolyline);
          mapRef.current.addObject(routeGroup);

          // Add markers for origin, waypoints, and destination
          const createMarker = (
            lat: number,
            lng: number,
            label: string,
            color: string
          ) => {
            return new H.map.Marker(
              { lat, lng },
              {
                style: { fillColor: color },
              }
            );
          };

          // Origin marker (green)
          const originMarker = createMarker(
            origin.location.lat,
            origin.location.lng,
            "O",
            "#4CAF50"
          );
          routeGroup.addObject(originMarker);

          // Destination marker (red)
          const destMarker = createMarker(
            destination.location.lat,
            destination.location.lng,
            "D",
            "#F44336"
          );
          routeGroup.addObject(destMarker);

          // Waypoint markers (blue)
          waypoints.forEach((waypoint) => {
            const waypointMarker = createMarker(
              waypoint.location.lat,
              waypoint.location.lng,
              "W",
              "#2196F3"
            );
            routeGroup.addObject(waypointMarker);
          });

          // Fit map to route
          try {
            mapRef.current.getViewModel().setLookAtData({
              bounds: routeGroup.getBoundingBox(),
            });
          } catch (error) {
            console.warn("Could not fit map to route bounds:", error);
          }

          console.log("Route successfully added to map");
        } else {
          console.error("No routes found in result");
        }
      },
      // Error callback
      (error: any) => {
        console.error("Routing calculation failed:", error);
        console.error("Error details:", error.message || error);

        // Fallback: create simple visual route with lines
        console.log("Creating fallback visual route");
        try {
          const routeGroup = new H.map.Group();
          routeGroupRef.current = routeGroup;

          // Create line string with all points
          const lineString = new H.geo.LineString();
          [origin, ...waypoints, destination].forEach((order) => {
            lineString.pushPoint(order.location.lat, order.location.lng);
          });

          // Create route polyline
          const routePolyline = new H.map.Polyline(lineString, {
            style: {
              strokeColor: "#ff9800", // Orange for fallback
              lineWidth: 4,
              lineDash: [10, 5], // Dashed line to indicate fallback
            },
          });

          routeGroup.addObject(routePolyline);

          // Add markers
          const createMarker = (lat: number, lng: number, color: string) => {
            return new H.map.Marker(
              { lat, lng },
              {
                style: { fillColor: color },
              }
            );
          };

          routeGroup.addObject(
            createMarker(origin.location.lat, origin.location.lng, "#4CAF50")
          );
          routeGroup.addObject(
            createMarker(
              destination.location.lat,
              destination.location.lng,
              "#F44336"
            )
          );

          waypoints.forEach((waypoint) => {
            routeGroup.addObject(
              createMarker(
                waypoint.location.lat,
                waypoint.location.lng,
                "#2196F3"
              )
            );
          });

          if (mapRef.current) {
            mapRef.current.addObject(routeGroup);
          }

          console.log("Fallback route created successfully");
        } catch (fallbackError) {
          console.error("Fallback routing also failed:", fallbackError);
        }
      }
    );

    // Cleanup function
    return () => {
      try {
        if (mapRef.current && routeGroupRef.current) {
          mapRef.current.removeObject(routeGroupRef.current);
        }
      } catch (error) {
        console.warn("Error during route cleanup:", error);
      }
      routeGroupRef.current = null;
    };
  }, [isReady, mapRef]);

  return null; // This component doesn't render anything visible
};

export default HereRouting;
