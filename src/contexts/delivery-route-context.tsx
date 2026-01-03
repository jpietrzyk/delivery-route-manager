import { createContext } from "react";
import type { DeliveryRoute } from "@/types/delivery-route";
import type { Order } from "@/types/order";

export interface DeliveryRouteContextType {
  deliveries: DeliveryRoute[];
  currentDelivery: DeliveryRoute | null;
  deliveryOrders: Order[];
  unassignedOrders: Order[];
  setCurrentDelivery: (delivery: DeliveryRoute | null) => void;
  setDeliveries: (deliveries: DeliveryRoute[]) => void;
  createDelivery: (
    delivery: Omit<DeliveryRoute, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateDelivery: (
    id: string,
    updates: Partial<DeliveryRoute>
  ) => Promise<void>;
  deleteDelivery: (id: string) => Promise<void>;
  addOrderToDelivery: (
    deliveryId: string,
    orderId: string,
    atIndex?: number
  ) => Promise<void>;
  removeOrderFromDelivery: (
    deliveryId: string,
    orderId: string
  ) => Promise<void>;
  reorderDeliveryOrders: (
    deliveryId: string,
    fromIndex: number,
    toIndex: number
  ) => Promise<void>;
  refreshDeliveries: () => Promise<void>;
  refreshDeliveryOrders: (deliveryId?: string) => Promise<Order[]>;
  refreshUnassignedOrders: () => Promise<void>;
}

export const DeliveryRouteContext = createContext<
  DeliveryRouteContextType | undefined
>(undefined);
