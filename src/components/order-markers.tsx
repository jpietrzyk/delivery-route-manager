// src/components/OrderMarkers.tsx
import { useEffect } from "react";
import { useHereMap } from "@/hooks/useHereMap";
import { sampleOrders } from "@/types/order";

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
const createSvgIcon = (priority: string, status: string) => {
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

  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="${bgColor}" stroke="${color}" stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="${color}"/>
      <circle cx="16" cy="16" r="3" fill="white"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const OrderMarkers: React.FC = () => {
  const { isReady, mapRef } = useHereMap();

  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    // Get the HERE Maps API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const H = (window as any).H;
    if (!H) {
      console.error("HERE Maps SDK not available");
      return;
    }

    const map = mapRef.current as any;

    // Create a group for all order markers
    const markerGroup = new H.map.Group();

    // Create markers for each order
    sampleOrders.forEach((order) => {
      // Create marker with order information
      const marker = new H.map.Marker({
        lat: order.location.lat,
        lng: order.location.lng,
      });

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

      // Add hover events
      marker.addEventListener("pointerenter", () => {
        const tooltip = new H.ui.InfoBubble(marker.getGeometry(), {
          content: tooltipContent,
        });
        H.ui.UI.getUi(map).addBubble(tooltip);
        (marker as any)._tooltip = tooltip;
      });

      marker.addEventListener("pointerleave", () => {
        const tooltip = (marker as any)._tooltip;
        if (tooltip) {
          H.ui.UI.getUi(map).removeBubble(tooltip);
        }
      });

      // Style marker based on priority
      const icon = new H.map.Icon(createSvgIcon(order.priority, order.status));
      marker.setIcon(icon);

      markerGroup.addObject(marker);
    });

    // Add the group to the map
    map.addObject(markerGroup);

    // Center map to fit all markers
    if (sampleOrders.length > 0) {
      const boundingBox = markerGroup.getBoundingBox();
      map.getViewModel().setLookAtData({
        bounds: boundingBox,
      });
    }

    // Cleanup function
    return () => {
      map.removeObject(markerGroup);
    };
  }, [isReady]);

  return null; // This component doesn't render anything visible
};

export default OrderMarkers;
