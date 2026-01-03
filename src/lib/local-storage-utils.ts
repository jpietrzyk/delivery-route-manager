import type { Order } from '@/types/order';
import type { DeliveryRoute } from '@/types/delivery-route';

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
 * Reset all local storage data and fetch all data from the endpoint
 */
export function resetLocalStorageAndFetchData(): void {
  try {
    // Clear all local storage data
    localStorage.removeItem(LOCAL_STORAGE_KEYS.OPTIMISTIC_DELIVERY_UPDATES);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.OPTIMISTIC_ORDER_UPDATES);

    // Reload the page to fetch all data from the endpoint
    window.location.reload();
  } catch (error) {
    console.error('Error resetting local storage:', error);
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
/**
 * @deprecated This function is no longer used in the waypoint-based architecture
 * Deliveries are now metadata-only, and orders are managed via DeliveryRouteWaypointsApi
 *
 * Kept for reference only - can be removed in future cleanup
 */
export function applyPendingDeliveryUpdates(
  delivery: DeliveryRoute
): DeliveryRoute {
  // No longer applies delivery-order updates since deliveries no longer embed orders
  // Orders are managed separately via the waypoint API
  return delivery;
}
