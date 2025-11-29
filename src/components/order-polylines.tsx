// src/components/OrderPolylines.tsx
import React, { useEffect, useRef } from "react";
import { useHereMap } from "@/hooks/useHereMap";
import { sampleOrders } from "@/types/order";
import type { MapPolyline } from "@/types/here-maps";

// Helper function to get polyline color based on order progression
const getPolylineColor = (index: number, totalOrders: number) => {
  // Create a gradient effect based on order progression
  const hue = (index / totalOrders) * 240; // 0-240 degrees (red to blue)
  return `hsl(${hue}, 70%, 50%)`;
};

const OrderPolylines: React.FC = () => {
  const { isReady, mapRef } = useHereMap();
  const polylinesRef = useRef<MapPolyline[]>([]);
  const polylineGroupRef = useRef<unknown>(null);

  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    // Get the HERE Maps API
    const H = window.H;
    if (!H) {
      console.error("HERE Maps SDK not available");
      return;
    }

    const map = mapRef.current;

    try {
      // Create a group for all polylines
      const polylineGroup = new H.map.Group();

      // Sort orders by creation date to create a logical route
      const sortedOrders = [...sampleOrders].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Create a LineString for the main route
      const lineString = new H.geo.LineString();
      sortedOrders.forEach((order) => {
        lineString.pushPoint(order.location.lat, order.location.lng);
      });

      // Create the main polyline
      if (sortedOrders.length >= 2) {
        const routePolyline = new H.map.Polyline(lineString, {
          style: {
            lineWidth: 4,
            strokeColor: "#3b82f6", // Blue color
            lineTail: "round",
            lineHead: "round",
          },
        });

        polylineGroup.addObject(routePolyline);
        polylinesRef.current.push(routePolyline);

        // Create individual colored segments for each route segment
        for (let i = 0; i < sortedOrders.length - 1; i++) {
          const segmentLineString = new H.geo.LineString();
          segmentLineString.pushPoint(
            sortedOrders[i].location.lat,
            sortedOrders[i].location.lng
          );
          segmentLineString.pushPoint(
            sortedOrders[i + 1].location.lat,
            sortedOrders[i + 1].location.lng
          );

          const segmentColor = getPolylineColor(i, sortedOrders.length - 1);

          const segmentPolyline = new H.map.Polyline(segmentLineString, {
            style: {
              lineWidth: 2,
              strokeColor: segmentColor,
              lineTail: "round",
              lineHead: "round",
            },
          });

          polylineGroup.addObject(segmentPolyline);
          polylinesRef.current.push(segmentPolyline);
        }
      }

      // Add the group to the map
      map.addObject(polylineGroup);

      // Store group reference for cleanup
      polylineGroupRef.current = polylineGroup;
    } catch (error) {
      console.error("Error creating polylines:", error);
    }

    // Cleanup function
    return () => {
      try {
        if (mapRef.current && polylineGroupRef.current) {
          mapRef.current.removeObject(polylineGroupRef.current);
        }
      } catch (error) {
        console.warn("Error during polyline cleanup:", error);
      }
      polylinesRef.current = [];
      polylineGroupRef.current = null;
    };
  }, [isReady, mapRef]);

  return null; // This component doesn't render anything visible
};

export default OrderPolylines;
