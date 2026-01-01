import type { Delivery, DeliveryRouteItem } from '@/types/delivery';
import { sampleDeliveries } from '@/types/delivery';
import type { Order } from '@/types/order';

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
class DeliveriesApiClass {
  private deliveries: Delivery[] = [];
  private loaded = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.loaded) return;

    try {
      // Check if we're in a browser environment (fetch is available)
      if (typeof fetch !== 'undefined') {
        // Load delivery data from JSON file
        const response = await fetch('/delivery-DEL-001.json');
        if (!response.ok) {
          throw new Error('Failed to load delivery data');
        }

        const deliveryData = await response.json();

        // Define interface for the JSON route item
        interface JsonRouteItem {
          id: string;
          orderId: string;
        }

        // Convert the JSON structure to our Delivery interface
        const delivery: Delivery = {
          id: deliveryData.id,
          name: deliveryData.description || `Delivery ${deliveryData.id}`,
          status: 'scheduled', // Default status
          createdAt: new Date(deliveryData.createdAt),
          updatedAt: new Date(deliveryData.updatedAt),
          orders: deliveryData.routeItems.map((item: JsonRouteItem, index: number) => ({
            orderId: item.orderId,
            sequence: index,
            status: 'pending' as const,
            driveTimeEstimate: 0,
            driveTimeActual: 0,
          })),
          notes: 'Delivery route loaded from JSON',
          estimatedDistance: 0,
          estimatedDuration: 0,
        };

        this.deliveries = [delivery];
      } else {
        // In Node.js environment (tests), use sample data
        this.deliveries = [...sampleDeliveries];
      }

      this.loaded = true;
    } catch (error) {
      console.error('Error loading delivery data:', error);
      // Fallback to sample data if loading fails
      this.deliveries = [...sampleDeliveries];
      this.loaded = true;
    }
  }

  // Get all deliveries
  async getDeliveries(): Promise<Delivery[]> {
    // Ensure initialization is complete
    await this.ensureInitialized();

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...this.deliveries];
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.loaded) {
      await this.initialize();
    }
  }

  // Get a single delivery by ID
  async getDelivery(id: string): Promise<Delivery | null> {
    await this.ensureInitialized();
    await new Promise((resolve) => setTimeout(resolve, 100));
    const delivery = this.deliveries.find((d) => d.id === id);
    return delivery ? { ...delivery } : null;
  }

  // Get delivery with populated order data
  async getDeliveryWithOrders(
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

  // Create a new delivery
  async createDelivery(delivery: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>): Promise<Delivery> {
    await this.ensureInitialized();
    await new Promise((resolve) => setTimeout(resolve, 100));

    const now = new Date();
    const newDelivery: Delivery = {
      ...delivery,
      id: `DEL-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    this.deliveries.push(newDelivery);
    return { ...newDelivery };
  }

  // Update an existing delivery
  async updateDelivery(id: string, updates: Partial<Delivery>): Promise<Delivery | null> {
    await this.ensureInitialized();
    await new Promise((resolve) => setTimeout(resolve, 100));

    const index = this.deliveries.findIndex((d) => d.id === id);
    if (index === -1) return null;

    this.deliveries[index] = {
      ...this.deliveries[index],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };

    return { ...this.deliveries[index] };
  }

  // Delete a delivery
  async deleteDelivery(id: string): Promise<boolean> {
    await this.ensureInitialized();
    await new Promise((resolve) => setTimeout(resolve, 100));

    const index = this.deliveries.findIndex((d) => d.id === id);
    if (index === -1) return false;

    this.deliveries.splice(index, 1);
    return true;
  }

  // Add an order to a delivery
  async addOrderToDelivery(
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

  // Remove an order from a delivery
  async removeOrderFromDelivery(deliveryId: string, orderId: string): Promise<Delivery | null> {
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

  // Reorder orders within a delivery
  async reorderDeliveryOrders(
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

  // Update the status of an order within a delivery
  async updateDeliveryOrderStatus(
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

  // Update delivery status
  async updateDeliveryStatus(
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

export const DeliveriesApi = new DeliveriesApiClass();
