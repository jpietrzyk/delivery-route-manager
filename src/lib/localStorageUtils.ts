import type { Order } from '@/types/order';
import type { Delivery } from '@/types/delivery';

// Local storage keys
const LOCAL_STORAGE_KEYS = {
  OPTIMISTIC_DELIVERY_UPDATES: 'optimistic_delivery_updates',
  OPTIMISTIC_ORDER_UPDATES: 'optimistic_order_updates',
};

export interface OptimisticDeliveryUpdate {
  deliveryId: string;
  orderId: string;
  action: 'add' | 'remove';
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

export interface OptimisticOrderUpdate {
  orderId: string;
  deliveryId: string | null | undefined;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

/**
 * Get all pending optimistic delivery updates from local storage
 */
export function getPendingDeliveryUpdates(): OptimisticDeliveryUpdate[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.OPTIMISTIC_DELIVERY_UPDATES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading optimistic delivery updates:', error);
    return [];
  }
}

/**
 * Get all pending optimistic order updates from local storage
 */
export function getPendingOrderUpdates(): OptimisticOrderUpdate[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.OPTIMISTIC_ORDER_UPDATES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading optimistic order updates:', error);
    return [];
  }
}

/**
 * Add an optimistic delivery update to local storage
 */
export function addOptimisticDeliveryUpdate(update: Omit<OptimisticDeliveryUpdate, 'timestamp' | 'status'>): void {
  try {
    const pendingUpdates = getPendingDeliveryUpdates();
    const newUpdate: OptimisticDeliveryUpdate = {
      ...update,
      timestamp: Date.now(),
      status: 'pending',
    };

    // Remove any existing updates for the same deliveryId + orderId combination
    const filteredUpdates = pendingUpdates.filter(
      (u) => !(u.deliveryId === update.deliveryId && u.orderId === update.orderId)
    );

    filteredUpdates.push(newUpdate);
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.OPTIMISTIC_DELIVERY_UPDATES,
      JSON.stringify(filteredUpdates)
    );
  } catch (error) {
    console.error('Error saving optimistic delivery update:', error);
  }
}

/**
 * Add an optimistic order update to local storage
 */
export function addOptimisticOrderUpdate(update: Omit<OptimisticOrderUpdate, 'timestamp' | 'status'>): void {
  try {
    const pendingUpdates = getPendingOrderUpdates();
    const newUpdate: OptimisticOrderUpdate = {
      ...update,
      timestamp: Date.now(),
      status: 'pending',
    };

    // Remove any existing updates for the same orderId
    const filteredUpdates = pendingUpdates.filter((u) => u.orderId !== update.orderId);

    filteredUpdates.push(newUpdate);
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.OPTIMISTIC_ORDER_UPDATES,
      JSON.stringify(filteredUpdates)
    );
  } catch (error) {
    console.error('Error saving optimistic order update:', error);
  }
}

/**
 * Mark an optimistic delivery update as completed
 */
export function markDeliveryUpdateCompleted(deliveryId: string, orderId: string): void {
  try {
    const pendingUpdates = getPendingDeliveryUpdates();
    const updatedUpdates = pendingUpdates.map((update) => {
      if (update.deliveryId === deliveryId && update.orderId === orderId) {
        return { ...update, status: 'completed' };
      }
      return update;
    });

    localStorage.setItem(
      LOCAL_STORAGE_KEYS.OPTIMISTIC_DELIVERY_UPDATES,
      JSON.stringify(updatedUpdates)
    );
  } catch (error) {
    console.error('Error marking delivery update as completed:', error);
  }
}

/**
 * Mark an optimistic order update as completed
 */
export function markOrderUpdateCompleted(orderId: string): void {
  try {
    const pendingUpdates = getPendingOrderUpdates();
    const updatedUpdates = pendingUpdates.map((update) => {
      if (update.orderId === orderId) {
        return { ...update, status: 'completed' };
      }
      return update;
    });

    localStorage.setItem(
      LOCAL_STORAGE_KEYS.OPTIMISTIC_ORDER_UPDATES,
      JSON.stringify(updatedUpdates)
    );
  } catch (error) {
    console.error('Error marking order update as completed:', error);
  }
}

/**
 * Mark an optimistic delivery update as failed
 */
export function markDeliveryUpdateFailed(deliveryId: string, orderId: string): void {
  try {
    const pendingUpdates = getPendingDeliveryUpdates();
    const updatedUpdates = pendingUpdates.map((update) => {
      if (update.deliveryId === deliveryId && update.orderId === orderId) {
        return { ...update, status: 'failed' };
      }
      return update;
    });

    localStorage.setItem(
      LOCAL_STORAGE_KEYS.OPTIMISTIC_DELIVERY_UPDATES,
      JSON.stringify(updatedUpdates)
    );
  } catch (error) {
    console.error('Error marking delivery update as failed:', error);
  }
}

/**
 * Mark an optimistic order update as failed
 */
export function markOrderUpdateFailed(orderId: string): void {
  try {
    const pendingUpdates = getPendingOrderUpdates();
    const updatedUpdates = pendingUpdates.map((update) => {
      if (update.orderId === orderId) {
        return { ...update, status: 'failed' };
      }
      return update;
    });

    localStorage.setItem(
      LOCAL_STORAGE_KEYS.OPTIMISTIC_ORDER_UPDATES,
      JSON.stringify(updatedUpdates)
    );
  } catch (error) {
    console.error('Error marking order update as failed:', error);
  }
}

/**
 * Clear all completed and failed updates
 */
export function clearCompletedUpdates(): void {
  try {
    const deliveryUpdates = getPendingDeliveryUpdates().filter(
      (update) => update.status === 'pending'
    );
    const orderUpdates = getPendingOrderUpdates().filter(
      (update) => update.status === 'pending'
    );

    localStorage.setItem(
      LOCAL_STORAGE_KEYS.OPTIMISTIC_DELIVERY_UPDATES,
      JSON.stringify(deliveryUpdates)
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.OPTIMISTIC_ORDER_UPDATES,
      JSON.stringify(orderUpdates)
    );
  } catch (error) {
    console.error('Error clearing completed updates:', error);
  }
}

/**
 * Apply pending optimistic updates to orders
 */
export function applyPendingOrderUpdates(orders: Order[]): Order[] {
  try {
    const pendingUpdates = getPendingOrderUpdates();

    return orders.map((order) => {
      const pendingUpdate = pendingUpdates.find((update) => update.orderId === order.id);

      if (pendingUpdate) {
        return {
          ...order,
          deliveryId: pendingUpdate.deliveryId ?? undefined,
        };
      }

      return order;
    });
  } catch (error) {
    console.error('Error applying pending order updates:', error);
    return orders;
  }
}

/**
 * Apply pending optimistic updates to delivery orders
 */
export function applyPendingDeliveryUpdates(
  delivery: Delivery,
  orders: Order[]
): Delivery {
  try {
    const pendingUpdates = getPendingDeliveryUpdates();

    // Get delivery-specific updates
    const deliveryUpdates = pendingUpdates.filter(function(update) {
      return update.deliveryId === delivery.id;
    });

    if (deliveryUpdates.length === 0) {
      return delivery;
    }

    // Apply updates to delivery orders
    let updatedOrders = [...delivery.orders];

    for (let i = 0; i < deliveryUpdates.length; i++) {
      const update = deliveryUpdates[i];
      if (update.action === 'add') {
        // Check if order exists in the orders array
        const orderExists = orders.some(function(order) {
          return order.id === update.orderId;
        });
        const orderAlreadyInDelivery = updatedOrders.some(function(deliveryOrder) {
          return deliveryOrder.orderId === update.orderId;
        });

        if (orderExists && !orderAlreadyInDelivery) {
          updatedOrders.push({
            orderId: update.orderId,
            sequence: updatedOrders.length,
            status: 'pending' as const,
          });
        }
      } else if (update.action === 'remove') {
        updatedOrders = updatedOrders.filter(function(deliveryOrder) {
          return deliveryOrder.orderId !== update.orderId;
        });
      }
    }

    // Resequence orders
    updatedOrders = updatedOrders.map(function(order, index) {
      return {
        ...order,
        sequence: index,
      };
    });

    return {
      ...delivery,
      orders: updatedOrders,
    };
  } catch (error) {
    console.error('Error applying pending delivery updates:', error);
    return delivery;
  }
}
