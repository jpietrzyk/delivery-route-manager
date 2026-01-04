import React, { useState, useEffect, useCallback } from "react";
import { DeliveryRouteContext } from "./delivery-route-context";
import { DeliveryRoutesApi } from "@/services/deliveryRoutesApi";
import { DeliveryRouteWaypointsApi } from "@/services/deliveryRouteWaypointsApi";
import { OrdersApi } from "@/services/ordersApi";
import type { DeliveryRoute } from "@/types/delivery-route";
import type { Order } from "@/types/order";
import { getOrdersInSequence } from "@/lib/delivery-route-waypoint-helpers";
import { getUnassignedOrders } from "@/lib/utils";
import {
  addOptimisticDeliveryUpdate,
  addOptimisticOrderUpdate,
  markDeliveryUpdateCompleted,
  markOrderUpdateCompleted,
  markDeliveryUpdateFailed,
  markOrderUpdateFailed,
  applyPendingOrderUpdates,
} from "@/lib/local-storage-utils";

export default function DeliveryRouteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [deliveries, setDeliveries] = useState<DeliveryRoute[]>([]);
  const [currentDelivery, setCurrentDelivery] = useState<DeliveryRoute | null>(
    null
  );
  const [unassignedOrders, setUnassignedOrders] = useState<Order[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);

  // Fetch unassigned orders
  const refreshUnassignedOrders = useCallback(async () => {
    try {
      const orders = await OrdersApi.getOrders();
      // Apply pending optimistic updates
      const ordersWithPendingUpdates = applyPendingOrderUpdates(orders);

      // Get all waypoints across all deliveries
      const allWaypoints: Array<any> = [];
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
        allWaypoints
      );

      console.log(
        "[DeliveryRouteProvider] Unassigned orders:",
        unassigned.length,
        unassigned.map((o) => o.id)
      );
      setUnassignedOrders(unassigned);
    } catch (error) {
      console.error("Error fetching unassigned orders:", error);
    }
  }, [deliveries]);

  // Fetch orders for a specific delivery
  // NEW: Uses waypoint-based architecture (many-to-many relationship)
  const refreshDeliveryOrders = useCallback<
    (deliveryId?: string) => Promise<Order[]>
  >(
    async (deliveryId?: string) => {
      try {
        const targetDeliveryId = deliveryId || currentDelivery?.id;
        if (!targetDeliveryId) {
          setDeliveryOrders([]);
          return [];
        }

        // Get waypoints for this delivery (junction table)
        const waypoints =
          await DeliveryRouteWaypointsApi.getWaypointsByDelivery(
            targetDeliveryId
          );

        if (waypoints.length === 0) {
          setDeliveryOrders([]);
          return [];
        }

        // Fetch all orders
        const allOrders = await OrdersApi.getOrders();
        const ordersWithPendingUpdates = applyPendingOrderUpdates(allOrders);

        // Get orders in sequence using waypoints
        const ordersInSequence = getOrdersInSequence(
          waypoints,
          ordersWithPendingUpdates
        );

        console.log(
          "[DeliveryRouteProvider] Delivery orders for",
          targetDeliveryId,
          ":",
          ordersInSequence.length,
          ordersInSequence.map((o) => o.id)
        );
        setDeliveryOrders(ordersInSequence);
        return ordersInSequence;
      } catch (error) {
        console.error("Error fetching delivery orders:", error);
        return [];
      }
    },
    [currentDelivery?.id]
  );

  // Fetch all deliveries
  const refreshDeliveries = useCallback(async () => {
    try {
      const fetchedDeliveries = await DeliveryRoutesApi.getDeliveries();
      // No need to apply pending delivery updates here anymore
      // Orders are managed separately via waypoints
      setDeliveries(fetchedDeliveries);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  }, []);

  // Load deliveries and unassigned orders on mount
  useEffect(() => {
    const loadData = async () => {
      await refreshDeliveries();
      await refreshUnassignedOrders();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // POC: Auto-select first delivery as current delivery
  useEffect(() => {
    if (deliveries.length > 0 && !currentDelivery) {
      console.log(
        "[DeliveryRouteProvider] POC: Auto-selecting first delivery as current:",
        deliveries[0].id
      );
      setCurrentDelivery(deliveries[0]);
    }
  }, [deliveries, currentDelivery]);

  // Auto-refresh delivery orders when currentDelivery changes
  useEffect(() => {
    if (currentDelivery?.id) {
      void refreshDeliveryOrders(currentDelivery.id);
    } else {
      setDeliveryOrders([]);
    }
  }, [currentDelivery?.id, refreshDeliveryOrders]);

  // Synchronize delivery and unassigned orders to avoid duplicates
  useEffect(() => {
    if (deliveryOrders.length === 0 || unassignedOrders.length === 0) {
      return;
    }

    // Create a Set of delivery order IDs
    const deliveryOrderIds = new Set(deliveryOrders.map((o) => o.id));

    // Filter out any unassigned orders that are also in delivery orders
    const uniqueUnassignedOrders = unassignedOrders.filter(
      (order) => !deliveryOrderIds.has(order.id)
    );

    // Only update if there were duplicates
    if (uniqueUnassignedOrders.length !== unassignedOrders.length) {
      console.log(
        "[DeliveryRouteProvider] Removed duplicate orders from unassigned list:",
        unassignedOrders
          .filter((o) => deliveryOrderIds.has(o.id))
          .map((o) => o.id)
      );
      setUnassignedOrders(uniqueUnassignedOrders);
    }
  }, [deliveryOrders, unassignedOrders]);

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
    []
  );

  // Update an existing delivery
  const updateDelivery = useCallback(
    async (id: string, updates: Partial<DeliveryRoute>) => {
      try {
        const updatedDelivery = await DeliveryRoutesApi.updateDelivery(
          id,
          updates
        );
        if (updatedDelivery) {
          setDeliveries((prev) =>
            prev.map((d) => (d.id === id ? updatedDelivery : d))
          );
          if (currentDelivery?.id === id) {
            setCurrentDelivery(updatedDelivery);
          }
        }
      } catch (error) {
        console.error("Error updating delivery:", error);
      }
    },
    [currentDelivery]
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
    [currentDelivery]
  );

  // Add an order to a delivery
  // NEW: Uses waypoint-based architecture
  const addOrderToDelivery = useCallback(
    async (deliveryId: string, orderId: string, atIndex?: number) => {
      try {
        // Optimistic update - add to local storage first
        addOptimisticDeliveryUpdate({
          deliveryId,
          orderId,
          action: "add",
        });
        addOptimisticOrderUpdate({
          orderId,
          deliveryId,
        });

        // Optimistic UI update - add to deliveryOrders if it's the current delivery
        if (currentDelivery?.id === deliveryId) {
          // Get all orders to find the one being added
          const allOrders = await OrdersApi.getOrders();
          const orderToAdd = allOrders.find((o) => o.id === orderId);

          if (orderToAdd) {
            setDeliveryOrders((prev) => {
              const index = atIndex ?? prev.length;
              const updated = [...prev];
              updated.splice(index, 0, orderToAdd);
              return updated;
            });
          }
        }

        // Remove from unassigned orders optimistically
        setUnassignedOrders((prev) =>
          prev.filter((order) => order.id !== orderId)
        );

        // Perform API calls in background
        try {
          // Add waypoint (order to delivery relationship)
          DeliveryRouteWaypointsApi.addWaypoint(deliveryId, orderId, atIndex);

          // Mark updates as completed
          markDeliveryUpdateCompleted(deliveryId, orderId);
          markOrderUpdateCompleted(orderId);
        } catch (error) {
          console.error("Error adding order to delivery:", error);
          // Mark updates as failed
          markDeliveryUpdateFailed(deliveryId, orderId);
          markOrderUpdateFailed(orderId);

          // TODO: Revert optimistic updates (would need to refetch data)
        }
      } catch (error) {
        console.error("Error adding order to delivery:", error);
      }
    },
    [currentDelivery?.id]
  );

  // Remove an order from a delivery (returns to unassigned)
  // NEW: Uses waypoint-based architecture
  const removeOrderFromDelivery = useCallback(
    async (deliveryId: string, orderId: string) => {
      try {
        // Optimistic update - add to local storage first
        addOptimisticDeliveryUpdate({
          deliveryId,
          orderId,
          action: "remove",
        });
        addOptimisticOrderUpdate({
          orderId,
          deliveryId: undefined,
        });

        // Optimistic UI update - remove from deliveryOrders
        setDeliveryOrders((prev) =>
          prev.filter((order) => order.id !== orderId)
        );

        // Optimistic update - add back to unassigned orders
        // We need to find the order from the original orders data
        const allOrders = await OrdersApi.getOrders();
        const orderToRestore = allOrders.find((order) => order.id === orderId);
        if (orderToRestore) {
          setUnassignedOrders((prev) => [...prev, orderToRestore]);
        }

        // Perform API calls in background
        try {
          // Remove waypoint (order from delivery relationship)
          DeliveryRouteWaypointsApi.removeWaypoint(deliveryId, orderId);

          // Mark updates as completed
          markDeliveryUpdateCompleted(deliveryId, orderId);
          markOrderUpdateCompleted(orderId);
        } catch (error) {
          console.error("Error removing order from delivery:", error);
          // Mark updates as failed
          markDeliveryUpdateFailed(deliveryId, orderId);
          markOrderUpdateFailed(orderId);

          // TODO: Revert optimistic updates (would need to refetch data)
        }
      } catch (error) {
        console.error("Error removing order from delivery:", error);
      }
    },
    []
  );

  // Reorder orders in a delivery
  // NEW: Uses waypoint-based architecture
  const reorderDeliveryOrders = useCallback(
    async (deliveryId: string, fromIndex: number, toIndex: number) => {
      try {
        // Optimistic UI update
        setDeliveryOrders((prev) => {
          const updated = [...prev];
          const [moved] = updated.splice(fromIndex, 1);
          updated.splice(toIndex, 0, moved);
          return updated;
        });

        // Perform API call in background
        try {
          DeliveryRouteWaypointsApi.reorderWaypoints(
            deliveryId,
            fromIndex,
            toIndex
          );
        } catch (error) {
          console.error("Error reordering delivery orders:", error);
          // TODO: Revert optimistic updates
        }
      } catch (error) {
        console.error("Error reordering delivery orders:", error);
      }
    },
    []
  );

  const value = {
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

  return (
    <DeliveryRouteContext.Provider value={value}>
      {children}
    </DeliveryRouteContext.Provider>
  );
}
