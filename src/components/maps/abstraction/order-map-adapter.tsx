/**
 * OrderMapAdapter - Transforms Order domain models to minimal map data
 * This adapter pattern separates business logic from map rendering
 */
import React from "react";
import type { Order } from "@/types/order";
import type { MapMarkerData, MapRouteSegmentData, MapBounds } from "./map-data";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";
import { useOrderHighlight } from "@/hooks/use-order-highlight";
import { useSegmentHighlight } from "@/hooks/use-segment-highlight";
import { useDeliveryRoute } from "@/hooks/use-delivery-route";
import { OrdersApi } from "@/services/ordersApi";

// Popup content creator (extracted from LeafletMap)
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

interface OrderMapAdapterProps {
  orders: Order[];
  unassignedOrders: Order[];
  onOrderAddedToDelivery?: (orderId: string) => void;
  onRefreshRequested?: () => void;
  children: (props: {
    markers: MapMarkerData[];
    routes: MapRouteSegmentData[];
    bounds: MapBounds;
    onMarkerHover: (markerId: string, isHovering: boolean) => void;
    onRouteSegmentHover: (segmentId: string, isHovering: boolean) => void;
  }) => React.ReactNode;
}

/**
 * OrderMapAdapter - Transforms Order objects to map-agnostic data
 * Handles all business logic and context interactions
 */
const OrderMapAdapter: React.FC<OrderMapAdapterProps> = ({
  orders,
  unassignedOrders,
  onOrderAddedToDelivery,
  onRefreshRequested,
  children,
}) => {
  const { highlightedOrderId, setHighlightedOrderId } = useMarkerHighlight();
  const { currentOrderId, previousOrderId } = useOrderHighlight();
  const { highlightedSegmentId, setHighlightedSegmentId } =
    useSegmentHighlight();
  const { currentDelivery, removeOrderFromDelivery, addOrderToDelivery } =
    useDeliveryRoute();

  const ORANGE_THRESHOLD = 13000;

  // Transform orders to markers
  const markers: MapMarkerData[] = React.useMemo(() => {
    // Create a Set of delivery order IDs to avoid duplicates
    const deliveryOrderIds = new Set(orders.map((o) => o.id));

    // Combine arrays, but filter out any unassigned orders that are also in delivery orders
    const allOrders = [
      ...orders,
      ...unassignedOrders.filter((order) => !deliveryOrderIds.has(order.id)),
    ];

    return allOrders.map((order) => {
      const isPool = !order.deliveryId;
      let type: MapMarkerData["type"] = "delivery";

      if (isPool) {
        type =
          (order.totalAmount ?? 0) > ORANGE_THRESHOLD
            ? "pool-high-value"
            : "pool";
      }

      const popupContent = createOrderPopupContent(
        order,
        isPool,
        async () => {
          try {
            if (isPool) {
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
              if (currentDelivery) {
                await removeOrderFromDelivery(currentDelivery.id, order.id);
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
      );

      return {
        id: order.id,
        location: order.location,
        type,
        isHighlighted: highlightedOrderId === order.id,
        isCurrentOrder: currentOrderId === order.id,
        isPreviousOrder: previousOrderId === order.id,
        popupContent,
      };
    });
  }, [
    orders,
    unassignedOrders,
    highlightedOrderId,
    currentOrderId,
    previousOrderId,
    currentDelivery,
    addOrderToDelivery,
    removeOrderFromDelivery,
    onOrderAddedToDelivery,
    onRefreshRequested,
  ]);

  // Transform consecutive orders to route segments
  const routes: MapRouteSegmentData[] = React.useMemo(() => {
    if (orders.length < 2) return [];

    const segments: MapRouteSegmentData[] = [];
    for (let i = 0; i < orders.length - 1; i++) {
      const fromOrder = orders[i];
      const toOrder = orders[i + 1];
      const segmentId = `${fromOrder.id}-${toOrder.id}`;

      // Determine if highlighted and what color
      const isFromHighlighted = highlightedOrderId === fromOrder.id;
      const isToHighlighted = highlightedOrderId === toOrder.id;
      const isSegmentHighlighted = highlightedSegmentId === segmentId;
      const isHighlighted =
        isFromHighlighted || isToHighlighted || isSegmentHighlighted;

      let highlightColor = "#10b981"; // Default green
      if (isToHighlighted) {
        highlightColor = "#eab308"; // Yellow for incoming
      } else if (isFromHighlighted) {
        highlightColor = "#10b981"; // Green for outgoing
      }

      segments.push({
        id: segmentId,
        from: fromOrder.location,
        to: toOrder.location,
        isHighlighted,
        highlightColor,
      });
    }

    return segments;
  }, [orders, highlightedOrderId, highlightedSegmentId]);

  // Calculate bounds
  const bounds: MapBounds = React.useMemo(() => {
    // Create a Set of delivery order IDs to avoid duplicates
    const deliveryOrderIds = new Set(orders.map((o) => o.id));

    // Combine arrays, filtering out duplicates
    const allOrders = [
      ...orders,
      ...unassignedOrders.filter((order) => !deliveryOrderIds.has(order.id)),
    ];

    return {
      points: allOrders.map((order) => order.location),
    };
  }, [orders, unassignedOrders]);

  // Event handlers
  const handleMarkerHover = React.useCallback(
    (markerId: string, isHovering: boolean) => {
      setHighlightedOrderId(isHovering ? markerId : null);
    },
    [setHighlightedOrderId]
  );

  const handleRouteSegmentHover = React.useCallback(
    (segmentId: string, isHovering: boolean) => {
      setHighlightedSegmentId(isHovering ? segmentId : null);
    },
    [setHighlightedSegmentId]
  );

  return (
    <>
      {children({
        markers,
        routes,
        bounds,
        onMarkerHover: handleMarkerHover,
        onRouteSegmentHover: handleRouteSegmentHover,
      })}
    </>
  );
};

export default OrderMapAdapter;
