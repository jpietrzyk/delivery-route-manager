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
import { useRouteSegments } from "@/hooks/use-route-segments";
import { pl } from "@/lib/translations";

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
        {order.product?.name || pl.unknownOrder}
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
          {isPool ? pl.poolOrder : pl.deliveryOrder}
        </div>
      </div>
      <div style={{ fontSize: "13px", color: "#4b5563", marginBottom: "8px" }}>
        <strong style={{ color: "#374151" }}>{pl.customer}:</strong>{" "}
        {order.customer}
      </div>
      <div style={{ fontSize: "13px", marginBottom: "8px" }}>
        <strong style={{ color: "#374151" }}>{pl.status}:</strong>
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
        <strong style={{ color: "#374151" }}>{pl.priorityLabel}:</strong>
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
        <strong>{pl.location}:</strong> {order.location.lat.toFixed(4)},{" "}
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
          <strong style={{ color: "#374151" }}>{pl.total}:</strong> €
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
  const { setRouteSegments } = useRouteSegments();

  // Clear route segments for Leaflet (uses geometric calculations)
  React.useEffect(() => {
    setRouteSegments([]);
  }, [setRouteSegments]);

  const ORANGE_THRESHOLD = 13000;

  // Transform orders to markers
  const markers: MapMarkerData[] = React.useMemo(() => {
    // Deduplicate on initialization: filter unassigned orders that are also in delivery orders
    const deliveryOrderIds = new Set(orders.map((o) => o.id));
    const uniqueUnassignedOrders = unassignedOrders.filter(
      (order) => !deliveryOrderIds.has(order.id)
    );
    const allOrders = [...orders, ...uniqueUnassignedOrders];

    return allOrders.map((order) => {
      // Check if order is in delivery by checking if it's in the orders array (not by deliveryId field)
      // This is because orders from waypoint system don't have deliveryId set on the Order object
      const isPool = !deliveryOrderIds.has(order.id);
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

              await removeOrderFromDelivery(currentDelivery.id, order.id);
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
        isPool ? `➕ ${pl.addToDelivery}` : `➖ ${pl.removeFromDelivery}`,
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
    // Deduplicate: filter unassigned orders that are also in delivery orders
    const deliveryOrderIds = new Set(orders.map((o) => o.id));
    const uniqueUnassignedOrders = unassignedOrders.filter(
      (order) => !deliveryOrderIds.has(order.id)
    );
    const allOrders = [...orders, ...uniqueUnassignedOrders];

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
