import React, { useState, useEffect, useCallback } from "react";

import { DeliveryRouteContext } from "@/contexts/delivery-route-context";
import { RouteManagerContext } from "@/contexts/route-manager-context";
import {
  RouteSegmentsContext,
  type RouteSegmentData,
} from "@/contexts/route-segments-context";
import { MarkerHighlightContext } from "@/contexts/marker-highlight-context";
import { OrderHighlightContext } from "@/contexts/order-highlight-context";
import { SegmentHighlightContext } from "@/contexts/segment-highlight-context";
import { PolylineHighlightContext } from "@/contexts/polyline-highlight-context";
import { DeliveryRoutesApi } from "@/services/delivery-routes-api";
import { DeliveryRouteWaypointsApi } from "@/services/delivery-route-waypoints-api";
import { OrdersApi } from "@/services/orders-api";
import type {
  DeliveryRoute,
  DeliveryRouteWaypoint,
} from "@/types/delivery-route";
import type { Order } from "@/types/order";
import {
  addOptimisticDeliveryUpdate,
  markDeliveryUpdateCompleted,
  markDeliveryUpdateFailed,
  applyPendingOrderUpdates,
} from "@/lib/local-storage-utils";
import { RouteManager } from "@/services/route-manager";
import { getUnassignedOrders } from "@/lib/utils";

export default function DeliveryRouteManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Delivery state
  const [deliveries, setDeliveries] = useState<DeliveryRoute[]>([]);
  const [currentDelivery, setCurrentDelivery] = useState<DeliveryRoute | null>(
    null,
  );
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
  const [unassignedOrders, setUnassignedOrders] = useState<Order[]>([]);

  // Route manager state
  const [routeManager, setRouteManager] = useState<RouteManager | null>(null);

  // Route segments state (for actual routing API data)
  const [routeSegments, setRouteSegments] = useState<RouteSegmentData[]>([]);

  // Highlight states
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(
    null,
  );
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [previousOrderId, setPreviousOrderId] = useState<string | null>(null);
  const [highlightedSegmentId, setHighlightedSegmentId] = useState<
    string | null
  >(null);
  const [highlightedPolylineOrderId, setHighlightedPolylineOrderId] = useState<
    string | null
  >(null);

  // Fetch unassigned orders
  const refreshUnassignedOrders = useCallback(async () => {
    try {
      const orders = await OrdersApi.getOrders();
      // Apply pending optimistic updates
      const ordersWithPendingUpdates = applyPendingOrderUpdates(orders);

      // Get all waypoints across all deliveries
      const allWaypoints: DeliveryRouteWaypoint[] = [];
      if (deliveries && deliveries.length > 0) {
        for (const delivery of deliveries) {
          const waypoints =
            await DeliveryRouteWaypointsApi.getWaypointsByDelivery(delivery.id);
          allWaypoints.push(...waypoints);
        }
      }

      // Filter orders to get only those not assigned to any delivery
      const unassigned = getUnassignedOrders(
        ordersWithPendingUpdates,
        allWaypoints,
      );

      console.log(
        "[DeliveryRouteManagerProvider] Unassigned orders:",
        unassigned.length,
        unassigned.map((o) => o.id),
      );
      setUnassignedOrders(unassigned);
    } catch (error) {
      console.error("Error fetching unassigned orders:", error);
    }
  }, [deliveries]);

  // Fetch all deliveries
  const refreshDeliveries = useCallback(async () => {
    try {
      const fetchedDeliveries = await DeliveryRoutesApi.getDeliveries();
      // Deliveries are now metadata-only, no need to apply order-related updates
      setDeliveries(fetchedDeliveries);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  }, []);

  // Fetch orders for the current or provided delivery
  const refreshDeliveryOrders = useCallback(
    async (deliveryId?: string) => {
      try {
        const targetId = deliveryId ?? currentDelivery?.id;
        if (!targetId) {
          setDeliveryOrders([]);
          return [];
        }

        const allOrders = await OrdersApi.getOrders();
        const ordersWithPending = applyPendingOrderUpdates(allOrders);

        // Get waypoints for this delivery from waypoint API
        const waypoints =
          await DeliveryRouteWaypointsApi.getWaypointsByDelivery(targetId);

        // Create a map for O(1) lookup
        const ordersMap = new Map(
          ordersWithPending.map((order) => [order.id, order]),
        );

        // Convert waypoints to orders in sequence
        const inDelivery = waypoints
          .map((waypoint) => ordersMap.get(waypoint.orderId))
          .filter((order): order is Order => order !== undefined);

        setDeliveryOrders(inDelivery);
        return inDelivery;
      } catch (error) {
        console.error("Error fetching delivery orders:", error);
        return [];
      }
    },
    [currentDelivery],
  );

  // Load deliveries and unassigned orders on mount
  useEffect(() => {
    const loadData = async () => {
      await refreshDeliveries();
      await refreshUnassignedOrders();
      await refreshDeliveryOrders();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // POC: Auto-select first delivery as current delivery
  useEffect(() => {
    if (deliveries.length > 0 && !currentDelivery) {
      console.log(
        "[DeliveryRouteManagerProvider] POC: Auto-selecting first delivery as current:",
        deliveries[0].id,
      );
      setCurrentDelivery(deliveries[0]);
    }
  }, [deliveries, currentDelivery]);

  // Refresh delivery orders when current delivery changes
  useEffect(() => {
    void refreshDeliveryOrders();
  }, [currentDelivery, refreshDeliveryOrders]);

  // Create a new delivery
  const createDelivery = useCallback(
    async (delivery: Omit<DeliveryRoute, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newDelivery = await DeliveryRoutesApi.createDelivery(delivery);
        setDeliveries((prev) => [...prev, newDelivery]);
        setCurrentDelivery(newDelivery);
      } catch (error) {
        console.error("Error creating delivery:", error);
      }
    },
    [],
  );

  // Update an existing delivery
  const updateDelivery = useCallback(
    async (id: string, updates: Partial<DeliveryRoute>) => {
      try {
        const updatedDelivery = await DeliveryRoutesApi.updateDelivery(
          id,
          updates,
        );
        if (updatedDelivery) {
          setDeliveries((prev) =>
            prev.map((d) => (d.id === id ? updatedDelivery : d)),
          );
          if (currentDelivery?.id === id) {
            setCurrentDelivery(updatedDelivery);
          }
        }
      } catch (error) {
        console.error("Error updating delivery:", error);
      }
    },
    [currentDelivery],
  );

  // Delete a delivery
  const deleteDelivery = useCallback(
    async (id: string) => {
      try {
        const success = await DeliveryRoutesApi.deleteDelivery(id);
        if (success) {
          setDeliveries((prev) => prev.filter((d) => d.id !== id));
          if (currentDelivery?.id === id) {
            setCurrentDelivery(null);
          }
        }
      } catch (error) {
        console.error("Error deleting delivery:", error);
      }
    },
    [currentDelivery],
  );

  // Centralized optimistic helpers to keep deliveryOrders and unassignedOrders in sync
  // NEW: Simplified since deliveries no longer have embedded orders
  const applyOptimisticAdd = useCallback(
    (deliveryId: string, orderId: string, atIndex?: number) => {
      const orderFromUnassigned = unassignedOrders.find(
        (order) => order.id === orderId,
      );

      // Remove from unassigned orders
      setUnassignedOrders((prev) =>
        prev.filter((order) => order.id !== orderId),
      );

      // Add to delivery orders (if it's the current delivery)
      if (currentDelivery?.id === deliveryId && orderFromUnassigned) {
        setDeliveryOrders((prev) => {
          if (prev.some((order) => order.id === orderId)) return prev;
          const insertAt = atIndex ?? prev.length;
          const next = [...prev];
          next.splice(insertAt, 0, orderFromUnassigned);
          return next;
        });
      }
    },
    [currentDelivery?.id, unassignedOrders],
  );

  const applyOptimisticRemove = useCallback(
    (_deliveryId: string, orderId: string, restoredOrder?: Order) => {
      // Remove from delivery orders (if it's the current delivery)
      setDeliveryOrders((prev) => prev.filter((order) => order.id !== orderId));

      // Add back to unassigned orders
      if (restoredOrder) {
        setUnassignedOrders((prev) => [...prev, restoredOrder]);
      }
    },
    [],
  );

  // Add an order to a delivery (pulls from unassigned)
  const addOrderToDelivery = useCallback(
    async (deliveryId: string, orderId: string, atIndex?: number) => {
      try {
        // Optimistic update - add to local storage first
        addOptimisticDeliveryUpdate({
          deliveryId,
          orderId,
          action: "add",
        });

        // Optimistic UI update - update local state immediately
        applyOptimisticAdd(deliveryId, orderId, atIndex);

        // Perform API calls in background
        try {
          // Add it to the delivery using waypoint API
          DeliveryRouteWaypointsApi.addWaypoint(deliveryId, orderId, atIndex);

          // Mark updates as completed
          markDeliveryUpdateCompleted(deliveryId, orderId);
        } catch (error) {
          console.error("Error adding order to delivery:", error);
          // Mark updates as failed
          markDeliveryUpdateFailed(deliveryId, orderId);

          // Revert optimistic updates by refetching canonical data
          await refreshDeliveryOrders(deliveryId);
          await refreshUnassignedOrders();
          await refreshDeliveries();
        }
      } catch (error) {
        console.error("Error adding order to delivery:", error);
      }
    },
    [
      applyOptimisticAdd,
      refreshDeliveryOrders,
      refreshUnassignedOrders,
      refreshDeliveries,
    ],
  );

  // Remove an order from a delivery (returns to unassigned)
  const removeOrderFromDelivery = useCallback(
    async (deliveryId: string, orderId: string) => {
      try {
        // Optimistic update - add to local storage first
        addOptimisticDeliveryUpdate({
          deliveryId,
          orderId,
          action: "remove",
        });

        let restoredOrder = deliveryOrders.find(
          (order) => order.id === orderId,
        );
        if (!restoredOrder) {
          const allOrders = await OrdersApi.getAllOrders();
          restoredOrder = allOrders.find((order) => order.id === orderId);
        }

        // Optimistic UI update - update local state immediately
        applyOptimisticRemove(deliveryId, orderId, restoredOrder);

        // Perform API calls in background
        try {
          // Remove from delivery using waypoint API
          DeliveryRouteWaypointsApi.removeWaypoint(deliveryId, orderId);

          // Mark updates as completed
          markDeliveryUpdateCompleted(deliveryId, orderId);
        } catch (error) {
          console.error("Error removing order from delivery:", error);
          // Mark updates as failed
          markDeliveryUpdateFailed(deliveryId, orderId);

          // Revert optimistic updates by refetching canonical data
          await refreshDeliveryOrders(deliveryId);
          await refreshUnassignedOrders();
          await refreshDeliveries();
        }
      } catch (error) {
        console.error("Error removing order from delivery:", error);
      }
    },
    [
      applyOptimisticRemove,
      deliveryOrders,
      refreshDeliveryOrders,
      refreshUnassignedOrders,
      refreshDeliveries,
    ],
  );

  // Reorder orders in a delivery
  const reorderDeliveryOrders = useCallback(
    async (deliveryId: string, fromIndex: number, toIndex: number) => {
      try {
        // Use waypoint API to reorder
        DeliveryRouteWaypointsApi.reorderWaypoints(
          deliveryId,
          fromIndex,
          toIndex,
        );

        // Refresh UI to reflect changes
        await refreshDeliveryOrders(deliveryId);
        await refreshDeliveries();
      } catch (error) {
        console.error("Error reordering delivery orders:", error);
      }
    },
    [refreshDeliveryOrders, refreshDeliveries],
  );

  const deliveryContextValue = {
    deliveries,
    currentDelivery,
    deliveryOrders,
    unassignedOrders,
    setCurrentDelivery,
    setDeliveries,
    createDelivery,
    updateDelivery,
    deleteDelivery,
    addOrderToDelivery,
    removeOrderFromDelivery,
    reorderDeliveryOrders,
    refreshDeliveries,
    refreshDeliveryOrders,
    refreshUnassignedOrders,
  };

  const routeManagerContextValue = {
    routeManager,
    setRouteManager,
  };

  const routeSegmentsContextValue = {
    routeSegments,
    setRouteSegments,
  };

  const markerHighlightContextValue = {
    highlightedOrderId,
    setHighlightedOrderId,
  };

  const orderHighlightContextValue = {
    currentOrderId,
    previousOrderId,
    setCurrentOrderId,
    setPreviousOrderId,
  };

  const segmentHighlightContextValue = {
    highlightedSegmentId,
    setHighlightedSegmentId,
  };

  const polylineHighlightContextValue = {
    highlightedPolylineOrderId,
    setHighlightedPolylineOrderId,
  };

  return (
    <DeliveryRouteContext.Provider value={deliveryContextValue}>
      <RouteManagerContext.Provider value={routeManagerContextValue}>
        <RouteSegmentsContext.Provider value={routeSegmentsContextValue}>
          <MarkerHighlightContext.Provider value={markerHighlightContextValue}>
            <OrderHighlightContext.Provider value={orderHighlightContextValue}>
              <SegmentHighlightContext.Provider
                value={segmentHighlightContextValue}
              >
                <PolylineHighlightContext.Provider
                  value={polylineHighlightContextValue}
                >
                  {children}
                </PolylineHighlightContext.Provider>
              </SegmentHighlightContext.Provider>
            </OrderHighlightContext.Provider>
          </MarkerHighlightContext.Provider>
        </RouteSegmentsContext.Provider>
      </RouteManagerContext.Provider>
    </DeliveryRouteContext.Provider>
  );
}
