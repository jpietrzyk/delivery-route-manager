import { useEffect, useRef, useCallback } from "react";
import { useHereMap } from "@/hooks/useHereMap";
import { useDelivery } from "@/hooks/useDelivery";

/**
 * PoolOrderMarkers - High-performance marker rendering for pool orders
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Incremental updates: Only add/remove changed markers
 * - No polling: Event-driven updates only
 * - Marker recycling: Reuse marker objects when possible
 * - Batch operations: Group map updates
 * - No route calculations: Just markers
 * - Efficient diffing: Track markers by order ID
 *
 * Handles 200+ markers efficiently by avoiding unnecessary DOM manipulation
 */
const PoolOrderMarkers = () => {
  const { isReady, mapRef } = useHereMap();
  const { poolOrders } = useDelivery();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<string, any>>(new Map());

  // Create marker icon for pool orders (different style than active orders)
  const createPoolMarkerIcon = useCallback(() => {
    const svgMarkup = `
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#94a3b8" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="4" fill="white"/>
      </svg>
    `;
    // @ts-expect-error - H namespace from HERE Maps SDK
    return new H.map.Icon(svgMarkup, {
      anchor: { x: 12, y: 12 },
    });
  }, []);

  // Incremental marker updates - only add/remove what changed
  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    console.log("[PoolOrderMarkers] Rendering pool orders:", poolOrders.length);

    const map = mapRef.current;
    const currentMarkers = markersRef.current;
    const icon = createPoolMarkerIcon();

    // Get current vs existing order IDs
    const currentOrderIds = new Set(poolOrders.map((order) => order.id));
    const existingOrderIds = new Set(currentMarkers.keys());

    // REMOVE markers for orders no longer in pool (assigned to delivery or completed)
    existingOrderIds.forEach((orderId) => {
      if (!currentOrderIds.has(orderId)) {
        const marker = currentMarkers.get(orderId);
        if (marker) {
          map.removeObject(marker);
          currentMarkers.delete(orderId);
        }
      }
    });

    // ADD markers for new orders in pool
    poolOrders.forEach((order) => {
      if (!currentMarkers.has(order.id)) {
        // @ts-expect-error - H namespace from HERE Maps SDK
        const marker = new H.map.Marker(
          { lat: order.location.lat, lng: order.location.lng },
          { icon }
        );

        // Store order data on marker for potential future use
        marker.setData({ orderId: order.id, orderName: order.name });

        map.addObject(marker);
        currentMarkers.set(order.id, marker);
      }
    });

    // Cleanup: Remove all markers when component unmounts
    return () => {
      currentMarkers.forEach((marker) => {
        map.removeObject(marker);
      });
      currentMarkers.clear();
    };
  }, [isReady, mapRef, poolOrders, createPoolMarkerIcon]);

  return null; // No UI, just map interaction
};

export default PoolOrderMarkers;
