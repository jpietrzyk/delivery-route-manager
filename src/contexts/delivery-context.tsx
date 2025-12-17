import { createContext } from "react";
import type { Delivery } from "@/types/delivery";
import type { Order } from "@/types/order";

export interface DeliveryContextType {
  deliveries: Delivery[];
  currentDelivery: Delivery | null;
  poolOrders: Order[];
  setCurrentDelivery: (delivery: Delivery | null) => void;
  setDeliveries: (deliveries: Delivery[]) => void;
  createDelivery: (
    delivery: Omit<Delivery, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateDelivery: (id: string, updates: Partial<Delivery>) => Promise<void>;
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
  refreshPoolOrders: () => Promise<void>;
}

export const DeliveryContext = createContext<DeliveryContextType | undefined>(
  undefined
);
