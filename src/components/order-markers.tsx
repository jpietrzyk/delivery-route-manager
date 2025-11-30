// src/components/OrderMarkers.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useHereMap } from "@/hooks/useHereMap";
import { OrdersApi } from "@/services/ordersApi";
import type { Order } from "@/types/order";
import { useMarkerHighlight } from "@/hooks/useMarkerHighlight";
import type { MapMarker } from "@/types/here-maps";
import type { HereMapsUI } from "@/types/here-maps";

// Extend MapMarker interface to include tooltip property
declare global {
  interface MapMarker {
    _tooltip?: import("@/types/here-maps").InfoBubble;
  }
}

// Helper function to get status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return { bg: "#fef3c7", text: "#92400e" };
    case "in-progress":
      return { bg: "#dbeafe", text: "#1e40af" };
    case "completed":
      return { bg: "#d1fae5", text: "#065f46" };
    case "cancelled":
      return { bg: "#fee2e2", text: "#991b1b" };
    default:
      return { bg: "#f3f4f6", text: "#374151" };
  }
};

// Create SVG icon based on priority
const createSvgIcon = (
  priority: string,
  status: string,
  isHighlighted = false
) => {
  let color = "#6b7280"; // default gray
  let bgColor = "#f9fafb";

  // Set colors based on priority
  switch (priority) {
    case "high":
      color = "#dc2626"; // red
      bgColor = "#fee2e2";
      break;
    case "medium":
      color = "#d97706"; // orange
      bgColor = "#fed7aa";
      break;
    case "low":
      color = "#059669"; // green
      bgColor = "#d1fae5";
      break;
  }

  // Adjust for cancelled status
  if (status === "cancelled") {
    color = "#991b1b"; // dark red
    bgColor = "#fee2e2";
  }

  // Enhanced colors for highlighted state
  if (isHighlighted) {
    color = "#1d4ed8"; // bright blue
    bgColor = "#dbeafe"; // light blue background
  }

  const strokeWidth = isHighlighted ? "4" : "2";
  const markerScale = isHighlighted ? "1.2" : "1";

  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <g transform="scale(${markerScale}) translate(4, 4)">
        <circle cx="16" cy="16" r="12" fill="${bgColor}" stroke="${color}" stroke-width="${strokeWidth}"/>
        <circle cx="16" cy="16" r="6" fill="${color}"/>
        <circle cx="16" cy="16" r="3" fill="white"/>
        ${
          isHighlighted
            ? `
          <circle cx="16" cy="16" r="16" fill="none" stroke="${color}" stroke-width="1" opacity="0.3" stroke-dasharray="4,4"/>
        `
            : ""
        }
      </g>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const OrderMarkers: React.FC = () => {
  const { isReady, mapRef } = useHereMap();
  const { highlightedOrderId, setHighlightedOrderId } = useMarkerHighlight();
  const [orders, setOrders] = useState<Order[]>([]);

  // Store references to markers by order ID
  const markersRef = useRef<Map<string, MapMarker>>(new Map());

  // Fetch orders function
  const fetchOrders = useCallback(async () => {
    try {
      const fetchedOrders = await OrdersApi.getOrders();
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    // Get the HERE Maps API
    const H = window.H;
    if (!H) {
      console.error("HERE Maps SDK not available");
      return;
    }

    // Store ref values in local variables to avoid stale closures
    const map = mapRef.current;
    const currentMarkers = markersRef.current;

    // Create a group for all order markers
    const markerGroup = new H.map.Group();

    // Create markers for each order
    orders.forEach((order) => {
      // Create marker with order information
      const marker = new H.map.Marker({
        lat: order.location.lat,
        lng: order.location.lng,
      });

      // Store marker reference by order ID
      currentMarkers.set(order.id, marker);

      // Create tooltip content
      const statusColors = getStatusColor(order.status);
      const tooltipContent = `
        <div style="padding: 8px; max-width: 200px; font-family: system-ui, sans-serif;">
          <div style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">${
            order.name
          }</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
            <strong>Customer:</strong> ${order.customer}
          </div>
          <div style="font-size: 12px; margin-bottom: 4px;">
            <strong>Status:</strong>
            <span style="padding: 2px 6px; border-radius: 12px; font-size: 10px; font-weight: bold;
              background-color: ${statusColors.bg};
              color: ${statusColors.text};">
              ${order.status.toUpperCase()}
            </span>
          </div>
          <div style="font-size: 12px; margin-bottom: 4px;">
            <strong>Priority:</strong> ${order.priority.toUpperCase()}
          </div>
          <div style="font-size: 12px; color: #059669; margin-bottom: 4px;">
            <strong>📍 Location:</strong> ${order.location.lat.toFixed(
              4
            )}, ${order.location.lng.toFixed(4)}
          </div>
          ${
            order.totalAmount
              ? `
            <div style="font-size: 12px;">
              <strong>Total:</strong> €${order.totalAmount.toLocaleString()}
            </div>
          `
              : ""
          }
        </div>
      `;

      // Add tooltip behavior
      marker.setData(tooltipContent);

      // Store original icon for highlighting
      const originalIcon = new H.map.Icon(
        createSvgIcon(order.priority, order.status, false)
      );
      const highlightedIcon = new H.map.Icon(
        createSvgIcon(order.priority, order.status, true)
      );

      // Set initial icon
      marker.setIcon(originalIcon);

      // Add hover events
      marker.addEventListener("pointerenter", () => {
        // Set the highlighted order ID in context
        setHighlightedOrderId(order.id);

        // Highlight the marker
        marker.setIcon(highlightedIcon);

        // Show tooltip
        const tooltip = new H.ui.InfoBubble(marker.getGeometry(), {
          content: tooltipContent,
        });
        const ui: HereMapsUI = H.ui.UI.getUi(map);
        ui.addBubble(tooltip);
        // Store tooltip reference on marker
        marker._tooltip = tooltip;
      });

      marker.addEventListener("pointerleave", () => {
        // Clear the highlighted order ID in context
        setHighlightedOrderId(null);

        // Remove highlight
        marker.setIcon(originalIcon);

        // Hide and cleanup tooltip
        const tooltip = marker._tooltip;
        if (tooltip) {
          const ui: HereMapsUI = H.ui.UI.getUi(map);
          ui.removeBubble(tooltip);
          // Clear the tooltip reference
          delete marker._tooltip;
        }
      });

      markerGroup.addObject(marker);
    });

    // Add the group to the map
    map.addObject(markerGroup);

    // Center map to fit all markers
    if (orders.length > 0) {
      const boundingBox = markerGroup.getBoundingBox();
      map.getViewModel().setLookAtData({
        bounds: boundingBox,
      });
    }

    // Cleanup function
    return () => {
      // Use the local variables captured at the start of the effect
      // Clean up all tooltips before removing markers
      currentMarkers.forEach((marker) => {
        const tooltip = marker._tooltip;
        if (tooltip) {
          try {
            const ui: HereMapsUI = H.ui.UI.getUi(map);
            ui.removeBubble(tooltip);
          } catch (error) {
            // Silently ignore cleanup errors
            console.warn("Failed to cleanup tooltip:", error);
          }
          delete marker._tooltip;
        }
      });
      map.removeObject(markerGroup);
      // Clear the markers reference
      currentMarkers.clear();
    };
  }, [isReady, mapRef, setHighlightedOrderId, orders]);

  // Effect to handle context changes and update marker highlights
  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    const H = window.H;
    if (!H) return;

    // Update all markers based on highlightedOrderId
    orders.forEach((order) => {
      const marker = markersRef.current.get(order.id);
      if (!marker) return;

      const originalIcon = new H.map.Icon(
        createSvgIcon(order.priority, order.status, false)
      );
      const highlightedIcon = new H.map.Icon(
        createSvgIcon(order.priority, order.status, true)
      );

      // Check if this marker should be highlighted
      const shouldHighlight = highlightedOrderId === order.id;
      marker.setIcon(shouldHighlight ? highlightedIcon : originalIcon);
    });
  }, [highlightedOrderId, isReady, mapRef, orders]);

  return null; // This component doesn't render anything visible
};

export default OrderMarkers;
