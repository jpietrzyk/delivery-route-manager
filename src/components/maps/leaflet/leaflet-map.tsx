import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";

import L from "leaflet";
import React from "react";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";
import { useDelivery } from "@/hooks/use-delivery";
import type { Order } from "@/types/order";
import { OrdersApi } from "@/services/ordersApi";

// DEPRECATED: Logic should be moved to provider abstraction layer.
// Helper function to get status colors (consistent with pool markers)
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

// Create consistent popup content for both pool and delivery orders
const createOrderPopupContent = (
  order: Order,
  isPool: boolean,
  onToggle: () => void,
  toggleText: string,
  toggleColor: string
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
          backgroundColor: isPool ? "#f3f4f6" : "#dbeafe",
          borderRadius: "8px",
          marginBottom: "12px",
          borderLeft: "3px solid " + (isPool ? "#9ca3af" : "#3b82f6"),
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
          {isPool
            ? "📦 Pool Order (Unassigned)"
            : "🚛 Delivery Order (Assigned)"}
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
            backgroundColor: toggleColor,
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor =
              toggleColor === "#3b82f6" ? "#2563eb" : "#dc2626";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.15)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = toggleColor;
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.1)";
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
  onOrderAddedToDelivery?: (orderId: string) => void;
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

    // Filter to get only delivery orders for primary focus
    const deliveryOrders = orders.filter((order) => order.deliveryId);

    if (deliveryOrders.length === 1) {
      map.setView(deliveryOrders[0].location, 13);
    } else if (deliveryOrders.length > 1) {
      // Focus on delivery orders, but include pool orders in bounds for context
      const allOrders = [...deliveryOrders, ...unassignedOrders];
      const bounds = L.latLngBounds(
        allOrders.map((o) => [o.location.lat, o.location.lng])
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      // If no delivery orders, show all orders (pool orders)
      const bounds = L.latLngBounds(
        unassignedOrders.map((o) => [o.location.lat, o.location.lng])
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
    unassignedOrders.length
  );
  const { highlightedOrderId, setHighlightedOrderId } = useMarkerHighlight();
  const { currentDelivery, removeOrderFromDelivery, addOrderToDelivery } =
    useDelivery();

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
    []
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
    []
  );
  const poolHighPriceIcon = React.useMemo(
    () =>
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
    []
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
    []
  );

  // Use fixed threshold for orange marker
  const ORANGE_THRESHOLD = 13000;

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
      <MapFitter orders={orders} unassignedOrders={unassignedOrders} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {polylinePositions.length > 0 &&
        polylinePositions.map((positions, index) => {
          // Determine if this segment should be highlighted
          const fromOrderId = deliveryOrders[index]?.id;
          const isHighlighted = highlightedOrderId === fromOrderId;

          return (
            <Polyline
              key={index}
              positions={positions}
              pathOptions={{
                color: isHighlighted ? "#10b981" : "#2563eb", // Highlighted segment green, others blue
                weight: isHighlighted ? 6 : 4, // Highlighted segment thicker
                opacity: isHighlighted ? 1.0 : 0.8, // Highlighted segment more opaque
              }}
            />
          );
        })}
      {[...orders, ...unassignedOrders].map((order) => {
        const isPool = !order.deliveryId;
        let icon = defaultIcon;
        if (isPool) {
          if ((order.totalAmount ?? 0) > ORANGE_THRESHOLD) {
            icon = poolHighPriceIcon;
          } else {
            icon = poolIcon;
          }
        }
        if (highlightedOrderId === order.id) {
          icon = highlightIcon;
        }
        return (
          <Marker
            key={order.id}
            position={order.location}
            // @ts-expect-error: icon is supported by react-leaflet Marker but not in type definitions
            icon={icon as L.Icon}
            eventHandlers={{
              mouseover: () => setHighlightedOrderId(order.id),
              mouseout: () => setHighlightedOrderId(null),
            }}
          >
            <Popup>
              {createOrderPopupContent(
                order,
                isPool,
                async () => {
                  try {
                    if (isPool) {
                      // Add to delivery using the proper delivery context
                      if (currentDelivery) {
                        await addOrderToDelivery(currentDelivery.id, order.id);
                      } else {
                        await OrdersApi.updateOrder(order.id, {
                          deliveryId: "DEL-001",
                        });
                      }
                      onOrderAddedToDelivery?.(order.id);
                      onRefreshRequested?.();
                    } else {
                      // Remove from delivery using the proper delivery context
                      if (currentDelivery) {
                        await removeOrderFromDelivery(
                          currentDelivery.id,
                          order.id
                        );
                      } else {
                        await OrdersApi.updateOrder(order.id, {
                          deliveryId: undefined,
                        });
                      }
                      onRefreshRequested?.();
                    }
                  } catch (error) {
                    console.error(
                      isPool
                        ? "Failed to add order to delivery:"
                        : "Failed to remove order from delivery:",
                      error
                    );
                    alert(
                      isPool
                        ? "Failed to add order to delivery"
                        : "Failed to remove order from delivery"
                    );
                  }
                },
                isPool ? "➕ Add to Delivery" : "➖ Remove from Delivery",
                isPool ? "#3b82f6" : "#dc2626"
              )}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default LeafletMap;
