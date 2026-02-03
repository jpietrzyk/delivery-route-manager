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
import { useHereRoutes } from "@/hooks/use-here-routes";
import { pl } from "@/lib/translations";

interface OrderMapAdapterProps {
  orders: Order[];
  unassignedOrders: Order[];
  onOrderAddedToDelivery?: (orderId?: string) => void | Promise<void>;
  onRefreshRequested?: () => void;
  enableHereRouting?: boolean;
  children: (props: {
    markers: MapMarkerData[];
    routes: MapRouteSegmentData[];
    bounds: MapBounds;
    onMarkerHover: (markerId: string, isHovering: boolean) => void;
    onRouteSegmentHover: (segmentId: string, isHovering: boolean) => void;
    onMarkerClick?: (markerId: string) => void;
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
  enableHereRouting = false,
  children,
}) => {
  const { highlightedOrderId, setHighlightedOrderId } = useMarkerHighlight();
  const { currentOrderId, previousOrderId } = useOrderHighlight();
  const { highlightedSegmentId, setHighlightedSegmentId } =
    useSegmentHighlight();
  const { currentDelivery, removeOrderFromDelivery, addOrderToDelivery } =
    useDeliveryRoute();
  const { setRouteSegments } = useRouteSegments();

  // Get HERE Maps API key
  const hereApiKey = import.meta.env.VITE_HERE_MAPS_API_KEY as
    | string
    | undefined;
  console.log(
    "OrderMapAdapter: HERE API key available:",
    !!hereApiKey,
    "enableHereRouting:",
    enableHereRouting,
    "orders:",
    orders.length,
  );

  // Calculate HERE routes for the delivery orders
  const { routes: hereRoutes } = useHereRoutes({
    orders,
    apiKey: hereApiKey,
    enabled: enableHereRouting && orders.length >= 2 && !!hereApiKey,
  });

  // Clear route segments for Leaflet (uses geometric calculations)
  React.useEffect(() => {
    setRouteSegments([]);
  }, [setRouteSegments]);

  // Helper function to compute icon path based on marker state
  // Note: We use the same icon regardless of highlight state for performance
  // Visual highlighting is done via map rendering, not icon swapping
  const getIconPath = React.useCallback(
    (type: MapMarkerData["type"], waypointIndex?: number): string => {
      if (type === "delivery" && waypointIndex !== undefined) {
        return "/markers/marker-waypoint.svg";
      }

      return "/markers/marker-default.svg";
    },
    [],
  );

  // Transform orders to markers
  const markers: MapMarkerData[] = React.useMemo(() => {
    // Deduplicate on initialization: filter unassigned orders that are also in delivery orders
    const deliveryOrderIds = new Set(orders.map((o) => o.id));
    const uniqueUnassignedOrders = unassignedOrders.filter(
      (order) => !deliveryOrderIds.has(order.id),
    );
    const allOrders = [...orders, ...uniqueUnassignedOrders];

    // Assign waypointIndex to delivery markers (1-based)
    let deliverySeq = 0;
    return allOrders.map((order) => {
      const isUnassigned = !deliveryOrderIds.has(order.id);
      const matchesFilters = true; // All orders are shown; filtering happens at data table level
      let type: MapMarkerData["type"] = "delivery";
      if (isUnassigned) type = "unassigned";

      // Assign waypointIndex for delivery markers
      let waypointIndex: number | undefined = undefined;
      if (!isUnassigned) {
        waypointIndex = ++deliverySeq;
      }

      const isHighlighted = highlightedOrderId === order.id;
      const markerType = !matchesFilters ? "outfiltered" : type;
      const iconPath = getIconPath(markerType, waypointIndex);

      // Store popup data (order and callback) instead of JSX to avoid React element staling
      const popupData = {
        order: order as unknown as Record<string, unknown>,
        isUnassigned,
        toggleText: isUnassigned ? pl.addToDelivery : pl.removeFromDelivery,
        onToggle: async () => {
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
              await removeOrderFromDelivery(currentDelivery.id, order.id);
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
      };

      const markerData: MapMarkerData = {
        id: order.id,
        location: order.location,
        type: markerType,
        waypointIndex,
        isHighlighted,
        isCurrentOrder: currentOrderId === order.id,
        isPreviousOrder: previousOrderId === order.id,
        isDisabled: false,
        matchesFilters,
        priority: String(order.priority),
        status: order.status,
        totalAmount: order.totalAmount,
        popupData,
        iconPath,
      };
      return markerData;
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
    getIconPath,
  ]);

  const routes: MapRouteSegmentData[] = React.useMemo(() => {
    if (orders.length < 2) return [];

    const segments: MapRouteSegmentData[] = [];

    for (let i = 0; i < orders.length - 1; i++) {
      const fromOrder = orders[i];
      const toOrder = orders[i + 1];
      const segmentId = `${fromOrder.id}-${toOrder.id}`;

      // Use HERE route segment by index
      const hereSegment = enableHereRouting ? hereRoutes[i] : undefined;

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
        positions: hereSegment?.positions, // Use the real route polyline if available
        distance: hereSegment?.distance,
        duration: hereSegment?.duration,
        isHighlighted,
        highlightColor,
      });
    }

    return segments;
  }, [
    orders,
    hereRoutes,
    highlightedOrderId,
    highlightedSegmentId,
    enableHereRouting,
  ]);

  // Calculate bounds
  const bounds: MapBounds = React.useMemo(() => {
    // Deduplicate: filter unassigned orders that are also in delivery orders
    const deliveryOrderIds = new Set(orders.map((o) => o.id));
    const uniqueUnassignedOrders = unassignedOrders.filter(
      (order) => !deliveryOrderIds.has(order.id),
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
    [setHighlightedOrderId],
  );

  const handleRouteSegmentHover = React.useCallback(
    (segmentId: string, isHovering: boolean) => {
      setHighlightedSegmentId(isHovering ? segmentId : null);
    },
    [setHighlightedSegmentId],
  );

  const handleMarkerClick = React.useCallback(() => {
    // Marker click is handled by the renderer displaying the popup
    // This is a placeholder for any additional logic needed
  }, []);

  return (
    <>
      {children({
        markers,
        routes,
        bounds,
        onMarkerHover: handleMarkerHover,
        onRouteSegmentHover: handleRouteSegmentHover,
        onMarkerClick: handleMarkerClick,
      })}
    </>
  );
};

export default OrderMapAdapter;
