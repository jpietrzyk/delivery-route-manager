import React, { useState, useEffect, useCallback } from "react";
import { DeliveryRouteContext } from "./delivery-route-context";
import { DeliveryRoutesApi } from "@/services/deliveryRoutesApi";
import { OrdersApi } from "@/services/ordersApi";
import type { DeliveryRoute } from "@/types/delivery-route";
import type { Order } from "@/types/order";
import {
  addOptimisticDeliveryUpdate,
  addOptimisticOrderUpdate,
  markDeliveryUpdateCompleted,
  markOrderUpdateCompleted,
  markDeliveryUpdateFailed,
  markOrderUpdateFailed,
  applyPendingOrderUpdates,
  applyPendingDeliveryUpdates,
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

      // Filter out orders that are assigned to any delivery (double-check safety)
      const unassigned = ordersWithPendingUpdates.filter(
        (order) => !order.deliveryId
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
  }, []);

  // Fetch orders for a specific delivery
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

        const allOrders = await OrdersApi.getOrders();
        // Apply pending optimistic updates
        const ordersWithPendingUpdates = applyPendingOrderUpdates(allOrders);

        // Filter to get only orders assigned to this delivery
        const assignedOrders = ordersWithPendingUpdates.filter(
          (order) => order.deliveryId === targetDeliveryId
        );

        console.log(
          "[DeliveryRouteProvider] Delivery orders for",
          targetDeliveryId,
          ":",
          assignedOrders.length,
          assignedOrders.map((o) => o.id)
        );
        setDeliveryOrders(assignedOrders);
        return assignedOrders;
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
      const allOrders = await OrdersApi.getOrders();

      // Apply pending optimistic updates to each delivery
      const deliveriesWithPendingUpdates = fetchedDeliveries.map((delivery) =>
        applyPendingDeliveryUpdates(delivery, allOrders)
      );

      setDeliveries(deliveriesWithPendingUpdates);
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
        addOptimisticOrderUpdate({
          orderId,
          deliveryId,
        });

        // Optimistic UI update - update local state immediately
        setDeliveries((prev) => {
          return prev.map((d) => {
            if (d.id === deliveryId) {
              // Add the order to the delivery
              const updatedOrders = [...d.orders];
              const newIndex = atIndex ?? updatedOrders.length;

              // Check if order is already in delivery
              const orderAlreadyInDelivery = updatedOrders.some(
                (order) => order.orderId === orderId
              );

              if (!orderAlreadyInDelivery) {
                updatedOrders.splice(newIndex, 0, {
                  deliveryId,
                  orderId,
                  sequence: newIndex,
                  status: "pending",
                });

                // Resequence
                updatedOrders.forEach((order, index) => {
                  order.sequence = index;
                });
              }

              return {
                ...d,
                orders: updatedOrders,
              };
            }
            return d;
          });
        });

        // Update current delivery if it's the one being modified
        if (currentDelivery?.id === deliveryId) {
          setCurrentDelivery((prev) => {
            if (!prev) return null;

            const updatedOrders = [...prev.orders];
            const newIndex = atIndex ?? updatedOrders.length;

            // Check if order is already in delivery
            const orderAlreadyInDelivery = updatedOrders.some(
              (order) => order.orderId === orderId
            );

            if (!orderAlreadyInDelivery) {
              updatedOrders.splice(newIndex, 0, {
                deliveryId,
                orderId,
                sequence: newIndex,
                status: "pending",
              });

              // Resequence
              updatedOrders.forEach((order, index) => {
                order.sequence = index;
              });
            }

            return {
              ...prev,
              orders: updatedOrders,
            };
          });
        }

        // Optimistic update - remove from unassigned orders
        setUnassignedOrders((prev) =>
          prev.filter((order) => order.id !== orderId)
        );

        // Perform API calls in background
        try {
          // First, mark the order as assigned to this delivery
          await OrdersApi.updateOrder(orderId, { deliveryId });

          // Then add it to the delivery
          const updatedDelivery = await DeliveryRoutesApi.addOrderToDelivery(
            deliveryId,
            orderId,
            atIndex
          );

          if (updatedDelivery) {
            // Mark updates as completed
            markDeliveryUpdateCompleted(deliveryId, orderId);
            markOrderUpdateCompleted(orderId);
          }
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
    [currentDelivery]
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
        addOptimisticOrderUpdate({
          orderId,
          deliveryId: undefined,
        });

        // Optimistic UI update - update local state immediately
        setDeliveries((prev) => {
          return prev.map((d) => {
            if (d.id === deliveryId) {
              // Remove the order from the delivery
              const updatedOrders = d.orders
                .filter((order) => order.orderId !== orderId)
                .map((order, index) => ({
                  ...order,
                  sequence: index,
                }));

              return {
                ...d,
                orders: updatedOrders,
              };
            }
            return d;
          });
        });

        // Update current delivery if it's the one being modified
        if (currentDelivery?.id === deliveryId) {
          setCurrentDelivery((prev) => {
            if (!prev) return null;

            const updatedOrders = prev.orders
              .filter((order) => order.orderId !== orderId)
              .map((order, index) => ({
                ...order,
                sequence: index,
              }));

            return {
              ...prev,
              orders: updatedOrders,
            };
          });
        }

        // Optimistic update - add back to unassigned orders
        // We need to find the order from the original orders data
        const allOrders = await OrdersApi.getAllOrders();
        const orderToRestore = allOrders.find((order) => order.id === orderId);
        if (orderToRestore) {
          setUnassignedOrders((prev) => [
            ...prev,
            { ...orderToRestore, deliveryId: undefined },
          ]);
        }

        // Perform API calls in background
        try {
          // First, remove delivery assignment from order (returns to unassigned)
          await OrdersApi.updateOrder(orderId, { deliveryId: undefined });

          // Then remove from delivery
          const updatedDelivery =
            await DeliveryRoutesApi.removeOrderFromDelivery(
              deliveryId,
              orderId
            );

          if (updatedDelivery) {
            // Mark updates as completed
            markDeliveryUpdateCompleted(deliveryId, orderId);
            markOrderUpdateCompleted(orderId);
          }
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
    [currentDelivery]
  );

  // Reorder orders in a delivery
  const reorderDeliveryOrders = useCallback(
    async (deliveryId: string, fromIndex: number, toIndex: number) => {
      try {
        const updatedDelivery = await DeliveryRoutesApi.reorderDeliveryOrders(
          deliveryId,
          fromIndex,
          toIndex
        );
        if (updatedDelivery) {
          setDeliveries((prev) =>
            prev.map((d) => (d.id === deliveryId ? updatedDelivery : d))
          );
          if (currentDelivery?.id === deliveryId) {
            setCurrentDelivery(updatedDelivery);
          }
        }
      } catch (error) {
        console.error("Error reordering delivery orders:", error);
      }
    },
    [currentDelivery]
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
