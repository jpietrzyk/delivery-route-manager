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
import { useMapFilters } from "@/hooks/useMapFilters";
import { pl } from "@/lib/translations";
import { OrderPopupContent } from "./order-popup-content";
import { getMarkerStyle } from "./marker-style";

interface OrderMapAdapterProps {
  orders: Order[];
  unassignedOrders: Order[];
  unassignedOrderFilterStatus?: Map<string, boolean>;
  onOrderAddedToDelivery?: (orderId?: string) => void | Promise<void>;
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
  unassignedOrderFilterStatus,
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
  const { filters } = useMapFilters();

  // Clear route segments for Leaflet (uses geometric calculations)
  React.useEffect(() => {
    setRouteSegments([]);
  }, [setRouteSegments]);

  // Transform orders to markers
  const markers: MapMarkerData[] = React.useMemo(() => {
    // Deduplicate on initialization: filter unassigned orders that are also in delivery orders
    const deliveryOrderIds = new Set(orders.map((o) => o.id));
    const uniqueUnassignedOrders = unassignedOrders.filter(
      (order) => !deliveryOrderIds.has(order.id),
    );
    const allOrders = [...orders, ...uniqueUnassignedOrders];

    return allOrders.map((order) => {
      // Check if order is in delivery by checking if it's in the orders array (not by deliveryId field)
      // This is because orders from waypoint system don't have deliveryId set on the Order object
      const isUnassigned = !deliveryOrderIds.has(order.id);

      // Check if this unassigned order matches current filters
      const matchesFilters = isUnassigned
        ? (unassignedOrderFilterStatus?.get(order.id) ?? true)
        : true; // Delivery orders always match (no filtering applied to them)

      let type: MapMarkerData["type"] = "delivery";

      if (isUnassigned) {
        type = "unassigned";
      }

      const popupContent = (
        <OrderPopupContent
          order={order}
          isUnassigned={isUnassigned}
          toggleText={isUnassigned ? pl.addToDelivery : pl.removeFromDelivery}
          onToggle={async () => {
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
          }}
        />
      );

      // Create marker data for styling
      // If marker is outfiltered, force type to "outfiltered" for gray icon (applies to all marker types)
      const markerType = !matchesFilters ? "outfiltered" : type;
      const markerData: MapMarkerData = {
        id: order.id,
        location: order.location,
        type: markerType,
        isHighlighted: highlightedOrderId === order.id,
        isCurrentOrder: currentOrderId === order.id,
        isPreviousOrder: previousOrderId === order.id,
        isDisabled: false, // No longer disabling markers, using opacity instead
        matchesFilters,
        priority: order.priority,
        status: order.status,
        totalAmount: order.totalAmount,
        product: order.product,
        popupContent,
      };

      // Get custom icon URL based on filters
      const markerStyle = getMarkerStyle(markerData, filters);
      let customIconUrl: string | undefined = undefined;
      if (
        markerStyle &&
        markerStyle.icon &&
        "options" in markerStyle.icon &&
        markerStyle.icon.options &&
        "iconUrl" in markerStyle.icon.options
      ) {
        customIconUrl = markerStyle.icon.options.iconUrl;
      }

      return {
        ...markerData,
        customIconUrl,
      };
    });
  }, [
    orders,
    unassignedOrders,
    unassignedOrderFilterStatus,
    highlightedOrderId,
    currentOrderId,
    previousOrderId,
    currentDelivery,
    addOrderToDelivery,
    removeOrderFromDelivery,
    onOrderAddedToDelivery,
    onRefreshRequested,
    filters,
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
