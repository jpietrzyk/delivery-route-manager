/**
 * MapyOrderMapAdapter - Enhanced adapter for Mapy.cz with routing
 * Extends OrderMapAdapter functionality with Mapy.cz routing API integration
 */
import React, { useEffect, useState } from "react";
import L from "leaflet";
import type { Order } from "@/types/order";
import type { MapMarkerData, MapRouteSegmentData, MapBounds } from "./map-data";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";
import { useOrderHighlight } from "@/hooks/use-order-highlight";
import { useSegmentHighlight } from "@/hooks/use-segment-highlight";
import { useDeliveryRoute } from "@/hooks/use-delivery-route";
import { useRouteSegments } from "@/hooks/use-route-segments";
import { useMapFilters } from "@/hooks/useMapFilters";
import { pl } from "@/lib/translations";
import { MapyRoutingApi, type RouteSegment } from "@/services/mapyRoutingApi";
import { OrderPopupContent } from "./order-popup-content";
import { getMarkerStyle } from "./marker-style";

interface MapyOrderMapAdapterProps {
  orders: Order[];
  unassignedOrders: Order[];
  filteredUnassignedOrders?: Order[];
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

const MapyOrderMapAdapter: React.FC<MapyOrderMapAdapterProps> = ({
  orders,
  unassignedOrders,
  filteredUnassignedOrders,
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

  const [calculatedRoutes, setCalculatedRoutes] = useState<RouteSegment[]>([]);

  const ORANGE_THRESHOLD = 500000;
  const mapyApiKey = import.meta.env.VITE_MAPY_COM_API_KEY as
    | string
    | undefined;

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
          },
        );
        setCalculatedRoutes(segments);

        // Update context with route segment data for sidebar
        const segmentData = segments.map((seg, index) => ({
          id: `${orders[index].id}-${orders[index + 1].id}`,
          fromOrderId: orders[index].id,
          toOrderId: orders[index + 1].id,
          distance: seg.distance ?? 0,
          duration: seg.duration ?? 0,
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
      (order) => !deliveryOrderIds.has(order.id),
    );
    const allOrders = [...orders, ...uniqueUnassignedOrders];

    // Create set of filtered order IDs for fast lookup
    const filteredOrderIds = filteredUnassignedOrders
      ? new Set(filteredUnassignedOrders.map((o) => o.id))
      : null;

    return allOrders.map((order) => {
      // Check if order is in delivery by checking if it's in the orders array (not by deliveryId field)
      const isPool = !deliveryOrderIds.has(order.id);
      const isHighValue = order.product.price > ORANGE_THRESHOLD;

      // Check if this unassigned order is filtered out
      const matchesFilters =
        isPool && filteredOrderIds ? filteredOrderIds.has(order.id) : true;
      const isDisabled = !matchesFilters;

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

      // Create marker data for styling
      const markerData: MapMarkerData = {
        id: order.id,
        location: order.location,
        type,
        waypointIndex,
        isHighlighted: highlightedOrderId === order.id,
        isCurrentOrder: currentOrderId === order.id,
        isPreviousOrder: previousOrderId === order.id,
        isDisabled,
        matchesFilters,
        priority: order.priority,
        status: order.status,
        totalAmount: order.totalAmount,
        product: order.product,
        popupContent: (
          <OrderPopupContent
            order={order}
            isPool={isPool}
            toggleText={toggleText}
            onToggle={handleToggle}
          />
        ),
      };

      // Get custom icon URL based on filters
      const { icon } = getMarkerStyle(markerData, filters);
      const customIconUrl =
        icon instanceof L.Icon ? icon.options.iconUrl : undefined;

      return {
        ...markerData,
        customIconUrl,
      };
    });
  }, [
    orders,
    unassignedOrders,
    filteredUnassignedOrders,
    highlightedOrderId,
    currentOrderId,
    previousOrderId,
    currentDelivery,
    addOrderToDelivery,
    removeOrderFromDelivery,
    onOrderAddedToDelivery,
    onRefreshRequested,
    waypointIndexMap,
    filters,
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
      })),
    );

    return segments;
  }, [orders, calculatedRoutes, highlightedOrderId, highlightedSegmentId]);

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
      if (isHovering) {
        setHighlightedOrderId(markerId);
        setHighlightedOrderId(markerId);
      } else {
        setHighlightedOrderId(null);
        setHighlightedOrderId(null);
      }
    },
    [setHighlightedOrderId],
  );

  const handleRouteSegmentHover = React.useCallback(
    (segmentId: string, isHovering: boolean) => {
      if (isHovering) {
        setHighlightedSegmentId(segmentId);
      } else {
        setHighlightedSegmentId(null);
      }
    },
    [setHighlightedSegmentId],
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
