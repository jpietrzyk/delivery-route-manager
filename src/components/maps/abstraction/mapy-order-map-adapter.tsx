/**
 * MapyOrderMapAdapter - Enhanced adapter for Mapy.cz with routing
 * Extends OrderMapAdapter functionality with Mapy.cz routing API integration
 */
import React, { useEffect, useState } from "react";
import type { Order } from "@/types/order";
import type { MapMarkerData, MapRouteSegmentData, MapBounds } from "./map-data";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";
import { useOrderHighlight } from "@/hooks/use-order-highlight";
import { useSegmentHighlight } from "@/hooks/use-segment-highlight";
import { useDeliveryRoute } from "@/hooks/use-delivery-route";
import { useRouteSegments } from "@/hooks/use-route-segments";
import { pl } from "@/lib/translations";
import { MapyRoutingApi, type RouteSegment } from "@/services/mapyRoutingApi";

// Popup content creator (reused from OrderMapAdapter)
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
      {/* Header with Order ID */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          paddingBottom: "12px",
          borderBottom: "2px solid #f3f4f6",
        }}
      >
        <span
          style={{
            fontSize: "16px",
            fontWeight: "700",
            color: "#1f2937",
          }}
        >
          {order.id}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: "600",
            padding: "4px 10px",
            borderRadius: "12px",
            backgroundColor: statusColors.bg,
            color: statusColors.text,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {order.status.toUpperCase()}
        </span>
      </div>

      {/* Customer */}
      <div style={{ marginBottom: "10px" }}>
        <div
          style={{
            fontSize: "11px",
            color: "#6b7280",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "4px",
          }}
        >
          {pl.customer}
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: "500",
            color: "#374151",
          }}
        >
          {order.customer}
        </div>
      </div>

      {/* Product */}
      {order.product && (
        <div style={{ marginBottom: "10px" }}>
          <div
            style={{
              fontSize: "11px",
              color: "#6b7280",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "4px",
            }}
          >
            {pl.productDetails}
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            {order.product.name}
          </div>
        </div>
      )}

      {/* Total Amount */}
      {order.totalAmount != null && (
        <div style={{ marginBottom: "14px" }}>
          <div
            style={{
              fontSize: "11px",
              color: "#6b7280",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "4px",
            }}
          >
            {pl.totalAmountLabel}
          </div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#059669",
            }}
          >
            €{order.totalAmount.toFixed(2)}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "10px 16px",
          backgroundColor: toggleColor,
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
          transition: "all 0.2s",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.02)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
        }}
      >
        {toggleText}
      </button>
    </div>
  );
};

interface MapyOrderMapAdapterProps {
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

const MapyOrderMapAdapter: React.FC<MapyOrderMapAdapterProps> = ({
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

  const [calculatedRoutes, setCalculatedRoutes] = useState<RouteSegment[]>([]);

  const ORANGE_THRESHOLD = 13000;
  const mapyApiKey = import.meta.env.VITE_MAPY_CZ_API_KEY as string | undefined;

  // Map delivery order ids to their 1-based waypoint index
  const waypointIndexMap = React.useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((order, index) => {
      map.set(order.id, index + 1);
    });
    return map;
  }, [orders]);

  // Calculate routes when orders change
  useEffect(() => {
    const calculateRoutes = async () => {
      if (!mapyApiKey || orders.length < 2) {
        setCalculatedRoutes([]);
        return;
      }

      try {
        const waypoints = orders.map((order) => order.location);
        const segments = await MapyRoutingApi.calculateRouteSegments(
          waypoints,
          mapyApiKey,
          {
            routeType: "car_fast",
          }
        );
        setCalculatedRoutes(segments);

        // Update context with route segment data for sidebar
        const segmentData = segments.map((seg, index) => ({
          id: `${orders[index].id}-${orders[index + 1].id}`,
          fromOrderId: orders[index].id,
          toOrderId: orders[index + 1].id,
          distance: seg.distance,
          duration: seg.duration,
        }));
        setRouteSegments(segmentData);
      } catch (error) {
        console.error("Failed to calculate routes:", error);
        setCalculatedRoutes([]);
        setRouteSegments([]);
      }
    };

    calculateRoutes();
  }, [orders, mapyApiKey, setRouteSegments]);

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
      const isPool = !deliveryOrderIds.has(order.id);
      const isHighValue = order.totalAmount > ORANGE_THRESHOLD;

      // Determine marker type
      let type: "delivery" | "pool" | "pool-high-value" = "delivery";
      if (isPool) {
        type = isHighValue ? "pool-high-value" : "pool";
      }

      const waypointIndex = waypointIndexMap.get(order.id);

      // Handle toggle action
      const handleToggle = async () => {
        if (isPool) {
          // Add to delivery
          if (currentDelivery) {
            await addOrderToDelivery(currentDelivery.id, order.id);
            // Trigger refresh for both callbacks to ensure routes are recalculated
            onOrderAddedToDelivery?.(order.id);
            onRefreshRequested?.();
          }
        } else {
          // Remove from delivery
          if (currentDelivery) {
            await removeOrderFromDelivery(currentDelivery.id, order.id);
            onRefreshRequested?.();
          }
        }
      };

      const toggleText = isPool ? pl.addToDelivery : pl.removeFromDelivery;
      const toggleColor = isPool ? "#10b981" : "#ef4444";

      return {
        id: order.id,
        location: order.location,
        type,
        waypointIndex,
        isHighlighted: highlightedOrderId === order.id,
        isCurrentOrder: currentOrderId === order.id,
        isPreviousOrder: previousOrderId === order.id,
        popupContent: createOrderPopupContent(
          order,
          handleToggle,
          toggleText,
          toggleColor
        ),
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
    waypointIndexMap,
  ]);

  // Transform calculated routes to route segments
  const routes: MapRouteSegmentData[] = React.useMemo(() => {
    if (orders.length < 2) return [];

    const segments: MapRouteSegmentData[] = [];
    for (let i = 0; i < orders.length - 1; i++) {
      const fromOrder = orders[i];
      const toOrder = orders[i + 1];
      const segmentId = `${fromOrder.id}-${toOrder.id}`;

      // Get calculated route by index - the API returns segments in the same order as input waypoints
      const calculatedRoute = calculatedRoutes[i];

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
        positions: calculatedRoute?.positions, // Use calculated polyline if available
        distance: calculatedRoute?.distance,
        duration: calculatedRoute?.duration,
        isHighlighted,
        highlightColor,
      });
    }

    console.log(
      "MapyOrderMapAdapter - Route segments:",
      segments.map((s) => ({
        id: s.id,
        positionsCount: s.positions?.length || 0,
        distance: s.distance,
      }))
    );

    return segments;
  }, [orders, calculatedRoutes, highlightedOrderId, highlightedSegmentId]);

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
      if (isHovering) {
        setHighlightedOrderId(markerId);
        setHighlightedOrderId(markerId);
      } else {
        setHighlightedOrderId(null);
        setHighlightedOrderId(null);
      }
    },
    [setHighlightedOrderId]
  );

  const handleRouteSegmentHover = React.useCallback(
    (segmentId: string, isHovering: boolean) => {
      if (isHovering) {
        setHighlightedSegmentId(segmentId);
      } else {
        setHighlightedSegmentId(null);
      }
    },
    [setHighlightedSegmentId]
  );

  return (
    <>
      {children({
        markers,
        routes, // TESTING: Now drawing the calculated routes (should be only 1st->2nd)
        bounds,
        onMarkerHover: handleMarkerHover,
        onRouteSegmentHover: handleRouteSegmentHover,
      })}
    </>
  );
};

export default MapyOrderMapAdapter;
