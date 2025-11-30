import React, { useState, useCallback, useEffect } from "react";
import { OrdersApi } from "@/services/ordersApi";
import type { Order } from "@/types/order";
import {
  OrderRouteContext,
  type OrderRouteContextType,
} from "./OrderRouteContext";

export const OrderRouteProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [routeOrders, setRouteOrders] = useState<Order[]>([]);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Load orders from the API on component mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoadingOrders(true);
        setOrdersError(null);
        const orders = await OrdersApi.getOrders();
        setAvailableOrders(orders);
      } catch (error) {
        setOrdersError(
          error instanceof Error ? error.message : "Failed to fetch orders"
        );
        console.error("Error loading orders:", error);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    loadOrders();
  }, []);

  const moveOrder = useCallback((fromIndex: number, toIndex: number) => {
    setRouteOrders((currentOrders) => {
      const newOrders = [...currentOrders];
      const [movedOrder] = newOrders.splice(fromIndex, 1);
      newOrders.splice(toIndex, 0, movedOrder);
      return newOrders;
    });
  }, []);

  const addOrderToRoute = useCallback((order: Order) => {
    setRouteOrders((currentOrders) => {
      // Check if order already exists in route
      const exists = currentOrders.some((o) => o.id === order.id);
      if (!exists) {
        return [...currentOrders, order];
      }
      return currentOrders;
    });
  }, []);

  const removeOrderFromRoute = useCallback((orderId: string) => {
    setRouteOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== orderId)
    );
  }, []);

  const clearRoute = useCallback(() => {
    setRouteOrders([]);
  }, []);

  const initializeRouteWithAllOrders = useCallback(() => {
    // Sort orders by creation date as default route
    const sortedOrders = [...availableOrders].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    setRouteOrders(sortedOrders);
  }, [availableOrders]);

  const refreshOrders = useCallback(async () => {
    try {
      setIsLoadingOrders(true);
      setOrdersError(null);
      const orders = await OrdersApi.getOrders();
      setAvailableOrders(orders);
    } catch (error) {
      setOrdersError(
        error instanceof Error ? error.message : "Failed to refresh orders"
      );
      console.error("Error refreshing orders:", error);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  const contextValue: OrderRouteContextType = {
    routeOrders,
    availableOrders,
    isLoadingOrders,
    ordersError,
    setRouteOrders,
    moveOrder,
    addOrderToRoute,
    removeOrderFromRoute,
    clearRoute,
    initializeRouteWithAllOrders,
    isCalculatingRoute,
    setIsCalculatingRoute,
    refreshOrders,
  };

  return (
    <OrderRouteContext.Provider value={contextValue}>
      {children}
    </OrderRouteContext.Provider>
  );
};
