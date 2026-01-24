import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";

// Custom styles for Leaflet popups
const popupStyles = `
  .leaflet-popup-content-wrapper {
    background: rgba(255, 255, 255, 0.95) !important;
    border-radius: 12px !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    border: 1px solid rgba(229, 231, 235, 0.8) !important;
    backdrop-filter: blur(8px) !important;
  }
  .leaflet-popup-content {
    margin: 0 !important;
    font-family: system-ui, sans-serif !important;
  }
  .leaflet-popup-tip {
    background: rgba(255, 255, 255, 0.95) !important;
    border: 1px solid rgba(229, 231, 235, 0.8) !important;
  }
`;

import L from "leaflet";
import React from "react";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";
import { useOrderHighlight } from "@/hooks/use-order-highlight";
import { usePolylineHighlight } from "@/hooks/use-polyline-highlight";
import { useSegmentHighlight } from "@/hooks/use-segment-highlight";
import { useDeliveryRoute } from "@/hooks/use-delivery-route";
import { pl } from "@/lib/translations";
import type { Order } from "@/types/order";

// DEPRECATED: Logic should be moved to provider abstraction layer.
// Helper function to get status colors (consistent with unassigned markers)
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

// Create consistent popup content for both unassigned and delivery orders
const createOrderPopupContent = (
  order: Order,
  isUnassigned: boolean,
  onToggle: () => void,
  toggleText: string,
  toggleColor: string,
) => {
  const statusColors = getStatusColor(order.status);
  return (
    <div
      style={{
        padding: "16px",
        maxWidth: "280px",
        fontFamily: "system-ui, sans-serif",
        background: "white",
        borderRadius: "12px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          fontWeight: "600",
          marginBottom: "12px",
          fontSize: "16px",
          color: "#111827",
        }}
      >
        {order.product?.name || "Unknown Order"}
      </div>
      <div
        style={{
          padding: "8px 12px",
          backgroundColor: isUnassigned ? "#f3f4f6" : "#dbeafe",
          borderRadius: "8px",
          marginBottom: "12px",
          borderLeft: "3px solid " + (isUnassigned ? "#9ca3af" : "#3b82f6"),
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "#6b7280",
            textTransform: "uppercase",
            fontWeight: "600",
            letterSpacing: "0.5px",
          }}
        >
          {isUnassigned
            ? "📦 Unassigned Order"
            : "🚛 Assigned Order"}
        </div>
      </div>
      <div style={{ fontSize: "13px", color: "#4b5563", marginBottom: "8px" }}>
        <strong style={{ color: "#374151" }}>👤 Customer:</strong>{" "}
        {order.customer}
      </div>
      <div style={{ fontSize: "13px", marginBottom: "8px" }}>
        <strong style={{ color: "#374151" }}>📋 Status:</strong>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "16px",
            fontSize: "11px",
            fontWeight: "600",
            backgroundColor: statusColors.bg,
            color: statusColors.text,
          }}
        >
          {order.status.toUpperCase()}
        </span>
      </div>
      <div style={{ fontSize: "13px", marginBottom: "8px" }}>
        <strong style={{ color: "#374151" }}>⚡ Priority:</strong>
        <span
          style={{
            textTransform: "uppercase",
            fontWeight: "600",
            color: "#3b82f6",
          }}
        >
          {order.priority}
        </span>
      </div>
      <div style={{ fontSize: "13px", color: "#10b981", marginBottom: "10px" }}>
        <strong>📍 Location:</strong> {order.location.lat.toFixed(4)},{" "}
        {order.location.lng.toFixed(4)}
      </div>
      {order.totalAmount && (
        <div
          style={{
            fontSize: "13px",
            paddingTop: "10px",
            borderTop: "1px solid #e5e7eb",
            marginBottom: "12px",
          }}
        >
          <strong style={{ color: "#374151" }}>💰 Total:</strong> €
          {order.totalAmount.toLocaleString()}
        </div>
      )}
      <div
        style={{
          marginTop: "16px",
          paddingTop: "12px",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          style={{
            width: "100%",
            padding: "10px 16px",
            backgroundColor: "transparent",
            color: toggleColor,
            border: `2px solid ${toggleColor}`,
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = `${toggleColor}20`;
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {toggleText}
        </button>
      </div>
    </div>
  );
};

interface LeafletMapProps {
  orders?: Order[];
  unassignedOrders?: Order[];
  onOrderAddedToDelivery?: (orderId?: string) => void | Promise<void>;
  onRefreshRequested?: () => void;
}

function MapFitter({
  orders,
  unassignedOrders,
}: {
  orders: Order[];
  unassignedOrders: Order[];
}) {
  const map = useMap();
  React.useEffect(() => {
    if (orders.length === 0 && unassignedOrders.length === 0) return;

    const deliveryOrders = orders;

    if (deliveryOrders.length === 1) {
      map.setView(deliveryOrders[0].location, 13);
    } else if (deliveryOrders.length > 1) {
      const allOrders = [...deliveryOrders, ...unassignedOrders];
      const bounds = L.latLngBounds(
        allOrders.map((o) => [o.location.lat, o.location.lng]),
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      // If no delivery orders, show all orders (pool orders)
      const bounds = L.latLngBounds(
        unassignedOrders.map((o) => [o.location.lat, o.location.lng]),
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [orders, unassignedOrders, map]);
  return null;
}

const LeafletMap = ({
  orders = [],
  unassignedOrders = [],
  onOrderAddedToDelivery,
  onRefreshRequested,
}: LeafletMapProps) => {
  console.log("LeafletMap: Rendering with delivery orders:", orders.length);
  console.log(
    "LeafletMap: Rendering with unassigned orders:",
    unassignedOrders.length,
  );
  const { highlightedOrderId, setHighlightedOrderId } = useMarkerHighlight();
  const { currentOrderId, previousOrderId } = useOrderHighlight();
  const { highlightedPolylineOrderId } = usePolylineHighlight();
  const { highlightedSegmentId, setHighlightedSegmentId } =
    useSegmentHighlight();
  const { currentDelivery, removeOrderFromDelivery, addOrderToDelivery } =
    useDeliveryRoute();
  const deliveryOrderIds = React.useMemo(
    () => new Set(orders.map((order) => order.id)),
    [orders],
  );

  // Debug logging for order highlighting
  console.log("LeafletMap: highlightedOrderId:", highlightedOrderId);
  console.log(
    "LeafletMap: highlightedPolylineOrderId:",
    highlightedPolylineOrderId,
  );
  console.log("LeafletMap: currentOrderId:", currentOrderId);
  console.log("LeafletMap: previousOrderId:", previousOrderId);

  // Preload icons
  const defaultIcon = React.useMemo(
    () =>
      L.icon({
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
    [],
  );
  // Pool/unassigned marker icons
  const poolIcon = React.useMemo(
    () =>
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
    [],
  );
  const highlightIcon = React.useMemo(
    () =>
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
    [],
  );

  // Current order icon (blue)
  const currentOrderIcon = React.useMemo(
    () =>
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
    [],
  );

  // Previous order icon (yellow)
  const previousOrderIcon = React.useMemo(
    () =>
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
    [],
  );

  // Map of assigned delivery order ids to their 1-based waypoint position
  const waypointPositionMap = React.useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((order, index) => {
      map.set(order.id, index + 1);
    });
    return map;
  }, [orders]);

  // Create a numbered div icon so each assigned waypoint shows its sequence number
  const createNumberedIcon = React.useCallback(
    (iconUrl: string, badgeNumber?: number) => {
      const badge =
        badgeNumber !== undefined
          ? `<span style="position:absolute;top:2px;left:50%;transform:translateX(-50%);background:#111827;color:white;border-radius:9999px;padding:0 6px;font-size:12px;font-weight:700;line-height:18px;box-shadow:0 1px 2px rgba(0,0,0,0.25);">${badgeNumber}</span>`
          : "";

      return L.divIcon({
        html:
          `<div style="position:relative;display:inline-block;width:25px;height:41px;">` +
          `<img src="${iconUrl}" alt="marker" style="width:25px;height:41px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.25));" />` +
          badge +
          "</div>",
        className: "",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
    },
    [],
  );

  // State for tracking which polyline is currently hovered
  const [hoveredPolylineIndex, setHoveredPolylineIndex] = React.useState<
    number | null
  >(null);

  // Draw straight lines between consecutive DELIVERY order markers only
  const polylinePositions: [number, number][][] = [];
  const deliveryOrders = orders;
  if (deliveryOrders.length >= 2) {
    for (let i = 0; i < deliveryOrders.length - 1; i++) {
      polylinePositions.push([
        [deliveryOrders[i].location.lat, deliveryOrders[i].location.lng],
        [
          deliveryOrders[i + 1].location.lat,
          deliveryOrders[i + 1].location.lng,
        ],
      ]);
    }
  }

  return (
    <MapContainer style={{ width: "100%", height: "100%" }}>
      <style dangerouslySetInnerHTML={{ __html: popupStyles }} />
      <MapFitter orders={orders} unassignedOrders={unassignedOrders} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {polylinePositions.length > 0 &&
        polylinePositions.map((positions, index) => {
          // Determine if this segment should be highlighted
          const fromOrderId = deliveryOrders[index]?.id;
          const toOrderId = deliveryOrders[index + 1]?.id;
          const segmentId = `${fromOrderId}-${toOrderId}`;
          // Check if this polyline should be highlighted from existing contexts or direct hover
          const isHighlighted =
            highlightedOrderId === fromOrderId ||
            highlightedOrderId === toOrderId ||
            highlightedSegmentId === segmentId ||
            hoveredPolylineIndex === index;

          // Determine highlight color based on context
          let highlightColor = "#10b981"; // Default green for most cases
          if (highlightedOrderId === toOrderId) {
            // This polyline ends at the highlighted order (comes BEFORE the highlighted order)
            highlightColor = "#eab308"; // Yellow for "incoming" polyline
          } else if (highlightedOrderId === fromOrderId) {
            // This polyline starts at the highlighted order (comes AFTER the highlighted order)
            highlightColor = "#10b981"; // Green for "outgoing" polyline
          }

          console.log(
            `LeafletMap: Polyline ${segmentId} - fromOrderId: ${fromOrderId}, toOrderId: ${toOrderId}, highlightedOrderId: ${highlightedOrderId}, highlightedPolylineOrderId: ${highlightedPolylineOrderId}, hoveredPolylineIndex: ${hoveredPolylineIndex}, isHighlighted: ${isHighlighted}`,
          );

          return (
            <Polyline
              key={index}
              positions={positions}
              pathOptions={{
                color: isHighlighted ? highlightColor : "#2563eb", // Use different highlight colors (yellow for incoming, green for outgoing)
                weight: isHighlighted ? 6 : 4, // Highlighted segment thicker
                opacity: isHighlighted ? 1.0 : 0.8, // Highlighted segment more opaque
              }}
              eventHandlers={{
                mouseover: () => {
                  console.log("Polyline mouseover:", segmentId);
                  // Highlight the polyline and corresponding segment
                  setHoveredPolylineIndex(index);
                  setHighlightedSegmentId(segmentId);
                },
                mouseout: () => {
                  console.log("Polyline mouseout:", segmentId);
                  // Clear both polyline and segment highlighting
                  setHoveredPolylineIndex(null);
                  setHighlightedSegmentId(null);
                },
              }}
            />
          );
        })}
      {[...orders, ...unassignedOrders].map((order) => {
        const isUnassigned = !deliveryOrderIds.has(order.id);
        const waypointNumber = waypointPositionMap.get(order.id);
        let iconUrl =
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png";
        let icon = defaultIcon;
        if (isUnassigned) {
          iconUrl =
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png";
          icon = poolIcon;
        }
        if (highlightedOrderId === order.id) {
          iconUrl =
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png";
          icon = highlightIcon;
        } else if (currentOrderId === order.id) {
          iconUrl =
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png";
          icon = currentOrderIcon;
        } else if (previousOrderId === order.id) {
          iconUrl =
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png";
          icon = previousOrderIcon;
        }
        // For assigned delivery orders, overlay their sequence number on the icon
        const iconWithBadge =
          waypointNumber !== undefined
            ? createNumberedIcon(iconUrl, waypointNumber)
            : icon;
        return (
          <Marker
            key={order.id}
            position={order.location}
            // @ts-expect-error: icon is supported by react-leaflet Marker but not in type definitions
            icon={iconWithBadge as L.Icon}
            eventHandlers={{
              mouseover: () => setHighlightedOrderId(order.id),
              mouseout: () => setHighlightedOrderId(null),
            }}
          >
            <Popup>
              {createOrderPopupContent(
                order,
                isUnassigned,
                async () => {
                  try {
                    if (isUnassigned) {
                      if (!currentDelivery) {
                        alert("Wybierz najpierw trasę dostawy");
                        return;
                      }

                      await addOrderToDelivery(currentDelivery.id, order.id);
                      onOrderAddedToDelivery?.(order.id);
                      onRefreshRequested?.();
                    } else {
                      if (!currentDelivery) {
                        alert("Wybierz najpierw trasę dostawy");
                        return;
                      }

                      await removeOrderFromDelivery(
                        currentDelivery.id,
                        order.id,
                      );
                      onRefreshRequested?.();
                    }
                  } catch (error) {
                    console.error(
                      isUnassigned
                        ? "Failed to add order to delivery:"
                        : "Failed to remove order from delivery:",
                      error,
                    );
                    alert(
                      isUnassigned
                        ? "Failed to add order to delivery"
                        : "Failed to remove order from delivery",
                    );
                  }
                },
                isUnassigned ? pl.addToDelivery : pl.removeFromDelivery,
                isUnassigned ? "#3b82f6" : "#dc2626",
              )}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default LeafletMap;
