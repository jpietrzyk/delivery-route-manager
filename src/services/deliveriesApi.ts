import type { Delivery, DeliveryRouteItem } from '@/types/delivery';
import type { Order } from '@/types/order';
import deliveryData from '@/assets/delivery-DEL-001.json';

// Mock delay to simulate network request
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Convert JSON data to Delivery[] with proper Date objects
const sampleDeliveryData: Delivery[] = [
  {
    id: deliveryData.id,
    name: deliveryData.description || `Delivery ${deliveryData.id}`,
    status: 'scheduled' as const, // Default status
    createdAt: new Date(deliveryData.createdAt),
    updatedAt: new Date(deliveryData.updatedAt),
    orders: deliveryData.routeItems.map((item: { id: string; orderId: string }, index: number) => ({
      orderId: item.orderId,
      sequence: index,
      status: 'pending' as const,
      driveTimeEstimate: 0,
      driveTimeActual: 0,
    })),
    notes: 'Delivery route loaded from JSON',
    estimatedDistance: 0,
    estimatedDuration: 0,
  }
];

/**
 * DeliveriesApi - Manages delivery planning and order assignment
 *
 * WORKFLOW:
 * 1. Orders start in the "pool" (order.deliveryId = null, waiting for delivery)
 * 2. Create delivery and "pull" orders from pool → assigns them to delivery
 * 3. Assigned orders are removed from pool (order.deliveryId is set)
 * 4. Can add more orders from pool or remove orders (back to pool)
 * 5. Delivered orders leave the system (status = 'completed')
 *
 * NOTE: In a real implementation, this would coordinate with OrdersApi
 * to update order.deliveryId. For now, we mock this behavior.
 */
export class DeliveriesApi {
  /**
   * Fetch all deliveries
   * In the future, this will make a real HTTP request to the backend
   */
  static async getDeliveries(): Promise<Delivery[]> {
    // Simulate network delay
    await mockDelay(100);

    // Return a copy of the data to prevent external mutations
    return sampleDeliveryData.map(delivery => ({ ...delivery }));
  }

  /**
   * Get a specific delivery by ID
   */
  static async getDelivery(id: string): Promise<Delivery | null> {
    await mockDelay(100);

    const delivery = sampleDeliveryData.find(delivery => delivery.id === id);
    return delivery ? { ...delivery } : null;
  }

  /**
   * Get delivery with populated order data
   */
  static async getDeliveryWithOrders(
    id: string,
    orders: Order[]
  ): Promise<(Delivery & { orders: (DeliveryRouteItem & { order: Order })[] }) | null> {
    const delivery = await this.getDelivery(id);
    if (!delivery) return null;

    const ordersMap = new Map(orders.map((order) => [order.id, order]));

    const populatedOrders = delivery.orders
      .map((deliveryOrder) => {
        const order = ordersMap.get(deliveryOrder.orderId);
        if (!order) return null;
        return {
          ...deliveryOrder,
          order,
        };
      })
      .filter((order): order is DeliveryRouteItem & { order: Order } => order !== null);

    return {
      ...delivery,
      orders: populatedOrders,
    };
  }

  /**
   * Mock method for creating a new delivery
   * Future: This will be a POST request to the backend
   */
  static async createDelivery(delivery: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>): Promise<Delivery> {
    await mockDelay(100);

    const now = new Date();
    const newDelivery: Delivery = {
      ...delivery,
      id: `DEL-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    sampleDeliveryData.push(newDelivery);
    return { ...newDelivery };
  }

  /**
   * Mock method for updating an existing delivery
   * Future: This will be a PUT/PATCH request to the backend
   */
  static async updateDelivery(id: string, updates: Partial<Delivery>): Promise<Delivery | null> {
    await mockDelay(100);

    const index = sampleDeliveryData.findIndex((d) => d.id === id);
    if (index === -1) return null;

    sampleDeliveryData[index] = {
      ...sampleDeliveryData[index],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };

    return { ...sampleDeliveryData[index] };
  }

  /**
   * Mock method for deleting a delivery
   * Future: This will be a DELETE request to the backend
   */
  static async deleteDelivery(id: string): Promise<boolean> {
    await mockDelay(100);

    const index = sampleDeliveryData.findIndex((d) => d.id === id);
    if (index === -1) return false;

    sampleDeliveryData.splice(index, 1);
    return true;
  }

  /**
   * Mock method for adding an order to a delivery
   * Future: This will be a PUT/PATCH request to the backend
   */
  static async addOrderToDelivery(
    deliveryId: string,
    orderId: string,
    atIndex?: number
  ): Promise<Delivery | null> {
    const delivery = await this.getDelivery(deliveryId);
    if (!delivery) return null;

    const newDeliveryRouteItem: DeliveryRouteItem = {
      orderId,
      sequence: atIndex ?? delivery.orders.length,
      status: 'pending',
    };

    const updatedOrders = [...delivery.orders];

    if (atIndex !== undefined && atIndex >= 0 && atIndex <= delivery.orders.length) {
      updatedOrders.splice(atIndex, 0, newDeliveryRouteItem);
      // Resequence
      updatedOrders.forEach((order, index) => {
        order.sequence = index;
      });
    } else {
      updatedOrders.push(newDeliveryRouteItem);
    }

    return this.updateDelivery(deliveryId, { orders: updatedOrders });
  }

  /**
   * Mock method for removing an order from a delivery
   * Future: This will be a PUT/PATCH request to the backend
   */
  static async removeOrderFromDelivery(deliveryId: string, orderId: string): Promise<Delivery | null> {
    const delivery = await this.getDelivery(deliveryId);
    if (!delivery) return null;

    const updatedOrders = delivery.orders
      .filter((order) => order.orderId !== orderId)
      .map((order, index) => ({
        ...order,
        sequence: index,
      }));

    return this.updateDelivery(deliveryId, { orders: updatedOrders });
  }

  /**
   * Mock method for reordering orders within a delivery
   * Future: This will be a PUT/PATCH request to the backend
   */
  static async reorderDeliveryOrders(
    deliveryId: string,
    fromIndex: number,
    toIndex: number
  ): Promise<Delivery | null> {
    const delivery = await this.getDelivery(deliveryId);
    if (!delivery) return null;

    const updatedOrders = [...delivery.orders];
    const [removed] = updatedOrders.splice(fromIndex, 1);
    updatedOrders.splice(toIndex, 0, removed);

    // Resequence
    updatedOrders.forEach((order, index) => {
      order.sequence = index;
    });

    return this.updateDelivery(deliveryId, { orders: updatedOrders });
  }

  /**
   * Mock method for updating the status of an order within a delivery
   * Future: This will be a PUT/PATCH request to the backend
   */
  static async updateDeliveryOrderStatus(
    deliveryId: string,
    orderId: string,
    status: DeliveryRouteItem['status'],
    deliveredAt?: Date,
    notes?: string
  ): Promise<Delivery | null> {
    const delivery = await this.getDelivery(deliveryId);
    if (!delivery) return null;

    const updatedOrders = delivery.orders.map((order) =>
      order.orderId === orderId
        ? {
            ...order,
            status,
            deliveredAt: status === 'delivered' ? deliveredAt ?? new Date() : order.deliveredAt,
            notes: notes ?? order.notes,
          }
        : order
    );

    return this.updateDelivery(deliveryId, { orders: updatedOrders });
  }

  /**
   * Mock method for updating delivery status
   * Future: This will be a PUT/PATCH request to the backend
   */
  static async updateDeliveryStatus(
    deliveryId: string,
    status: Delivery['status'],
    startedAt?: Date,
    completedAt?: Date
  ): Promise<Delivery | null> {
    const updates: Partial<Delivery> = { status };

    if (status === 'in-progress' && startedAt) {
      updates.startedAt = startedAt;
    }

    if (status === 'completed' && completedAt) {
      updates.completedAt = completedAt;
    }

    return this.updateDelivery(deliveryId, updates);
  }
}
