import React, { useState, useEffect, useCallback } from "react";
import { DeliveryContext } from "./delivery-context";
import { DeliveriesApi } from "@/services/deliveriesApi";
import { OrdersApi } from "@/services/ordersApi";
import type { Delivery } from "@/types/delivery";
import type { Order } from "@/types/order";

export default function DeliveryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [currentDelivery, setCurrentDelivery] = useState<Delivery | null>(null);
  const [unassignedOrders, setUnassignedOrders] = useState<Order[]>([]);

  // Fetch unassigned orders
  const refreshUnassignedOrders = useCallback(async () => {
    try {
      const orders = await OrdersApi.getOrders();
      const unassigned = orders.filter((order) => !order.deliveryId);
      console.log(
        "[DeliveryProvider] Unassigned orders:",
        unassigned.length,
        unassigned.map((o) => o.id)
      );
      setUnassignedOrders(unassigned);
    } catch (error) {
      console.error("Error fetching unassigned orders:", error);
    }
  }, []);

  // Fetch all deliveries
  const refreshDeliveries = useCallback(async () => {
    try {
      const fetchedDeliveries = await DeliveriesApi.getDeliveries();
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
        "[DeliveryProvider] POC: Auto-selecting first delivery as current:",
        deliveries[0].id
      );
      setCurrentDelivery(deliveries[0]);
    }
  }, [deliveries, currentDelivery]);

  // Create a new delivery
  const createDelivery = useCallback(
    async (delivery: Omit<Delivery, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newDelivery = await DeliveriesApi.createDelivery(delivery);
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
    async (id: string, updates: Partial<Delivery>) => {
      try {
        const updatedDelivery = await DeliveriesApi.updateDelivery(id, updates);
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
        const success = await DeliveriesApi.deleteDelivery(id);
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
        // First, mark the order as assigned to this delivery
        await OrdersApi.updateOrder(orderId, { deliveryId });

        // Then add it to the delivery
        const updatedDelivery = await DeliveriesApi.addOrderToDelivery(
          deliveryId,
          orderId,
          atIndex
        );
        if (updatedDelivery) {
          setDeliveries((prev) =>
            prev.map((d) => (d.id === deliveryId ? updatedDelivery : d))
          );
          if (currentDelivery?.id === deliveryId) {
            setCurrentDelivery(updatedDelivery);
          }
          // Refresh unassigned (order is now removed from unassigned)
          await refreshUnassignedOrders();
        }
      } catch (error) {
        console.error("Error adding order to delivery:", error);
      }
    },
    [currentDelivery, refreshUnassignedOrders]
  );

  // Remove an order from a delivery (returns to unassigned)
  const removeOrderFromDelivery = useCallback(
    async (deliveryId: string, orderId: string) => {
      try {
        // First, remove delivery assignment from order (returns to unassigned)
        await OrdersApi.updateOrder(orderId, { deliveryId: undefined });

        // Then remove from delivery
        const updatedDelivery = await DeliveriesApi.removeOrderFromDelivery(
          deliveryId,
          orderId
        );
        if (updatedDelivery) {
          setDeliveries((prev) =>
            prev.map((d) => (d.id === deliveryId ? updatedDelivery : d))
          );
          if (currentDelivery?.id === deliveryId) {
            setCurrentDelivery(updatedDelivery);
          }
          // Refresh unassigned (order is now returned to unassigned)
          await refreshUnassignedOrders();
        }
      } catch (error) {
        console.error("Error removing order from delivery:", error);
      }
    },
    [currentDelivery, refreshUnassignedOrders]
  );

  // Reorder orders in a delivery
  const reorderDeliveryOrders = useCallback(
    async (deliveryId: string, fromIndex: number, toIndex: number) => {
      try {
        const updatedDelivery = await DeliveriesApi.reorderDeliveryOrders(
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
    refreshUnassignedOrders,
  };

  return (
    <DeliveryContext.Provider value={value}>
      {children}
    </DeliveryContext.Provider>
  );
}
