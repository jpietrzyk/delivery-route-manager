// src/components/OrderMarkers.tsx
import React, { useEffect, useRef } from "react";
import { useHereMap } from "@/hooks/useHereMap";
import type { Order } from "@/types/order";
import { useMarkerHighlight } from "@/hooks/useMarkerHighlight";
import { useOrderRoute } from "@/hooks/useOrderRoute";
import type { MapMarker } from "@/types/here-maps";
import type { HereMapsUI } from "@/types/here-maps";

// Extend MapMarker interface to include our custom properties
declare global {
  interface MapMarker {
    _tooltip?: import("@/types/here-maps").InfoBubble;
    _originalIcon?: MapIcon;
    _highlightedIcon?: MapIcon;
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

// Create SVG icon based on priority and active status
const createSvgIcon = (
  priority: string,
  status: string,
  isHighlighted = false,
  isActive = true
) => {
  let color = "#6b7280"; // default gray
  let bgColor = "#f9fafb";

  // Inactive orders always get gray
  if (!isActive) {
    color = "#9ca3af";
    bgColor = "#f3f4f6";
  } else {
    // Set colors based on priority for active orders
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
  }

  // Adjust for cancelled status
  if (status === "cancelled") {
    color = "#991b1b"; // dark red
    bgColor = "#fee2e2";
  }

  // Enhanced colors for highlighted state
  if (isHighlighted) {
    color = "#059669"; // bright green
    bgColor = "#d1fae5"; // light green background
  }

  const strokeWidth = isHighlighted ? "3" : "2";

  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(0, 0)">
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
  const { setHighlightedOrderId, highlightMarkerRef } = useMarkerHighlight();

  // Store references to markers by order ID
  const markersRef = useRef<Map<string, MapMarker>>(new Map());
  // Store local highlighted state for instant feedback without context delay
  const localHighlightedRef = useRef<string | null>(null);

  // Get orders directly from the shared context - no more polling!
  const { availableOrders } = useOrderRoute();

  // Show markers for orders with deliveryId (assigned to delivery)
  // Active orders get colored markers, inactive orders get gray markers
  const deliveryOrders = availableOrders.filter((order) => order.deliveryId);

  // Register the highlight function directly in the ref (no re-renders!)
  useEffect(() => {
    highlightMarkerRef.current = (orderId: string | null) => {
      markersRef.current.forEach((marker, id) => {
        const shouldHighlight = orderId === id;
        const icon = shouldHighlight
          ? marker._highlightedIcon
          : marker._originalIcon;
        if (icon) {
          marker.setIcon(icon);
        }
      });
      localHighlightedRef.current = orderId;
    };

    return () => {
      highlightMarkerRef.current = null;
    };
  }, [highlightMarkerRef]); // Ref is stable, won't cause re-renders

  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    // Get the HERE Maps API
    const H = window.H;
    if (!H) {
      console.error("HERE Maps SDK not available");
      return;
    }

    const map = mapRef.current;
    const currentMarkers = markersRef.current;

    // Get current order IDs
    const currentOrderIds = new Set(deliveryOrders.map((order) => order.id));
    const existingOrderIds = new Set(currentMarkers.keys());

    // Remove markers for orders that no longer exist
    existingOrderIds.forEach((orderId) => {
      if (!currentOrderIds.has(orderId)) {
        const marker = currentMarkers.get(orderId);
        if (marker) {
          // Cleanup tooltip
          const tooltip = marker._tooltip;
          if (tooltip) {
            try {
              map.removeObject(tooltip);
            } catch (error) {
              console.warn("Failed to cleanup tooltip:", error);
            }
            delete marker._tooltip;
          }
          // Remove marker from map
          map.removeObject(marker);
          currentMarkers.delete(orderId);
        }
      }
    });

    // Add markers for new orders only
    deliveryOrders.forEach((order: Order) => {
      // Skip if marker already exists
      if (currentMarkers.has(order.id)) {
        return;
      }

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
        createSvgIcon(order.priority, order.status, false, order.active)
      );
      const highlightedIcon = new H.map.Icon(
        createSvgIcon(order.priority, order.status, true, order.active)
      );

      // Store icons on the marker for later use
      marker._originalIcon = originalIcon;
      marker._highlightedIcon = highlightedIcon;

      // Set initial icon
      marker.setIcon(originalIcon);

      // Add hover events with instant local feedback
      marker.addEventListener("pointerenter", () => {
        // Update local reference for instant feedback without context delay
        localHighlightedRef.current = order.id;

        // Also update context to highlight corresponding sidebar item
        setHighlightedOrderId(order.id);

        // Highlight the marker immediately
        marker.setIcon(highlightedIcon);

        // Show tooltip
        const tooltip = new H.ui.InfoBubble(marker.getGeometry(), {
          content: tooltipContent,
        });
        map.addObject(tooltip);
        // Store tooltip reference on marker
        marker._tooltip = tooltip;
      });

      marker.addEventListener("pointerleave", () => {
        // Clear local reference
        localHighlightedRef.current = null;

        // Clear context to unhighlight sidebar item
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

      // Add marker directly to map (no group needed for incremental updates)
      map.addObject(marker);
    });

    // No cleanup function needed - markers persist across renders
    // They're only removed when their order is removed (above)
  }, [isReady, mapRef, deliveryOrders, setHighlightedOrderId]);

  // Note: Markers are now managed incrementally - only added/removed when orders change
  // No more destroying and recreating all markers on every render

  return null; // This component doesn't render anything visible
};

export default OrderMarkers;
