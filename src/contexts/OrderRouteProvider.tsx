import React, { useState, useCallback, useEffect } from "react";
import { OrdersApi } from "@/services/ordersApi";
import type { Order } from "@/types/order";
import {
  OrderRouteContext,
  type OrderRouteContextType,
} from "./OrderRouteContext";
import { useMarkerHighlight } from "@/hooks/useMarkerHighlight";

export const OrderRouteProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [routeOrders, setRouteOrders] = useState<Order[]>([]);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Get drag state to prevent updates during drag operations
  const { isDragging } = useMarkerHighlight();

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
    // Only add active orders to the route
    if (!order.active) return;

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
    // Sort active orders by creation date as default route
    const activeOrders = availableOrders.filter((order) => order.active);
    const sortedOrders = [...activeOrders].sort(
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

  // Initialize route with active orders when orders are loaded
  useEffect(() => {
    // Don't initialize during an active drag operation
    if (isDragging) {
      return;
    }

    if (
      !isLoadingOrders &&
      availableOrders.length > 0 &&
      routeOrders.length === 0
    ) {
      initializeRouteWithAllOrders();
    }
  }, [
    isLoadingOrders,
    availableOrders.length,
    routeOrders.length,
    initializeRouteWithAllOrders,
    isDragging,
  ]);

  // Update route orders when available orders change (filter out inactive orders)
  useEffect(() => {
    // Don't update routeOrders during an active drag operation
    if (isDragging) {
      return;
    }

    if (!isLoadingOrders && availableOrders.length > 0) {
      const activeOrders = availableOrders.filter((order) => order.active);
      setRouteOrders((currentRouteOrders) => {
        // Only update if the active orders have actually changed
        const currentActiveIds = currentRouteOrders.map((o) => o.id).sort();
        const newActiveIds = activeOrders.map((o) => o.id).sort();

        if (JSON.stringify(currentActiveIds) !== JSON.stringify(newActiveIds)) {
          // Sort by creation date to maintain consistent order
          return [...activeOrders].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
        return currentRouteOrders;
      });
    }
  }, [availableOrders, isLoadingOrders, isDragging]);

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
