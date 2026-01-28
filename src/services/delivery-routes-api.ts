import type { DeliveryRoute, DeliveryRouteWaypoint } from '@/types/delivery-route';
import { sampleDeliveries } from '@/types/delivery-route';
import type { Order } from '@/types/order';
import { DeliveryRouteWaypointsApi } from './delivery-route-waypoints-api';
import { getOrdersInSequence } from '@/lib/delivery-route-waypoint-helpers';
import { OrdersApi } from './orders-api';

/**
 * DeliveryRoutesApi - Manages delivery metadata and routing operations
 *
 * ARCHITECTURE: Many-to-Many Relationship
 * - DeliveryRoute: Contains ONLY metadata (name, status, driver, etc.)
 * - DeliveryRouteWaypoint: Junction table linking deliveries to orders
 * - Orders: Linked via waypoints, can appear in multiple draft deliveries
 *
 * WORKFLOW:
 * 1. Create delivery (metadata only, no orders yet)
 * 2. Add orders via DeliveryRouteWaypointsApi.addWaypoint()
 * 3. Reorder via DeliveryRouteWaypointsApi.reorderWaypoints()
 * 4. Remove orders via DeliveryRouteWaypointsApi.removeWaypoint()
 * 5. Get populated delivery: use getDeliveryWithOrders() convenience method
 *
 * NOTE: This API now uses DeliveryRouteWaypointsApi for all order operations
 */
class DeliveryRoutesApiClass {
  private deliveries: DeliveryRoute[] = [];
  private loaded = false;

  /**
   * Reset the loaded state - useful for testing
   */
  resetCache(): void {
    this.deliveries = [];
    this.loaded = false;
  }

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.loaded) return;

    try {
      // Check if we're in a browser environment (fetch is available)
      if (typeof fetch !== 'undefined') {
        // Load delivery metadata from mocked GET /deliveryRoutes endpoint
        const response = await fetch('/delivery-routes.json');
        if (!response.ok) {
          throw new Error('Failed to load delivery routes');
        }

        const deliveriesData = await response.json();

        // Convert the JSON array to our DeliveryRoute interface (metadata only)
        this.deliveries = deliveriesData.map((deliveryData: {
          id: string;
          name?: string;
          status?: string;
          driver?: { id: string; name: string };
          vehicle?: { id: string; licensePlate: string };
          scheduledDate?: string;
          startedAt?: string;
          completedAt?: string;
          createdAt: string;
          updatedAt: string;
          notes?: string;
          estimatedDistance?: number;
          estimatedDuration?: number;
        }) => ({
          id: deliveryData.id,
          name: deliveryData.name || `Delivery ${deliveryData.id}`,
          status: deliveryData.status || 'scheduled',
          driver: deliveryData.driver,
          vehicle: deliveryData.vehicle,
          scheduledDate: deliveryData.scheduledDate ? new Date(deliveryData.scheduledDate) : undefined,
          startedAt: deliveryData.startedAt ? new Date(deliveryData.startedAt) : undefined,
          completedAt: deliveryData.completedAt ? new Date(deliveryData.completedAt) : undefined,
          createdAt: new Date(deliveryData.createdAt),
          updatedAt: new Date(deliveryData.updatedAt),
          notes: deliveryData.notes,
          estimatedDistance: deliveryData.estimatedDistance,
          estimatedDuration: deliveryData.estimatedDuration,
        }));
      } else {
        // In Node.js environment (tests), use sample data
        this.deliveries = [...sampleDeliveries];
      }

      this.loaded = true;
    } catch (error) {
      console.error('Error loading delivery routes:', error);
      // Fallback to sample data if loading fails
      this.deliveries = [...sampleDeliveries];
      this.loaded = true;
    }
  }

  // Get all deliveries
  async getDeliveries(): Promise<DeliveryRoute[]> {
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
  async getDelivery(id: string): Promise<DeliveryRoute | null> {
    await this.ensureInitialized();
    await new Promise((resolve) => setTimeout(resolve, 100));
    const delivery = this.deliveries.find((d) => d.id === id);
    return delivery ? { ...delivery } : null;
  }

  // Get delivery with populated order data
  // This convenience method loads waypoints and populates with order data
  async getDeliveryWithOrders(
    id: string,
    orders: Order[]
  ): Promise<(DeliveryRoute & { orders: (DeliveryRouteWaypoint & { order: Order })[] }) | null> {
    const delivery = await this.getDelivery(id);
    if (!delivery) return null;

    // Get waypoints for this delivery
    const waypoints = await DeliveryRouteWaypointsApi.getWaypointsByDelivery(id);

    if (waypoints.length === 0) {
      return {
        ...delivery,
        orders: [],
      };
    }

    const ordersMap = new Map(orders.map((order) => [order.id, order]));

    const populatedOrders = waypoints
      .sort((a, b) => a.sequence - b.sequence)
      .map((waypoint) => {
        const order = ordersMap.get(waypoint.orderId);
        if (!order) return null;
        return {
          ...waypoint,
          order,
        };
      })
      .filter((order): order is DeliveryRouteWaypoint & { order: Order } => order !== null);

    return {
      ...delivery,
      orders: populatedOrders,
    };
  }

  /**
   * Get delivery with waypoints populated with order data
   * Uses the new waypoint-based service layer
   *
   * @param deliveryId - ID of the delivery
   * @returns Delivery with populated waypoints, or null if not found
   */
  async getDeliveryWithWaypoints(
    deliveryId: string
  ): Promise<(DeliveryRoute & { waypoints: (DeliveryRouteWaypoint & { order: Order })[] }) | null> {
    const delivery = await this.getDelivery(deliveryId);
    if (!delivery) return null;

    // Get waypoints for this delivery
    const waypoints = await DeliveryRouteWaypointsApi.getWaypointsByDelivery(deliveryId);
    if (waypoints.length === 0) {
      return {
        ...delivery,
        waypoints: [],
      };
    }

    // Get all orders
    const orders = await OrdersApi.getOrders();

    // Populate waypoints with order data
    const populatedWaypoints = getOrdersInSequence(waypoints, orders)
      .map((order) => {
        const waypoint = waypoints.find(w => w.orderId === order.id);
        return waypoint ? { ...waypoint, order } : null;
      })
      .filter((wp): wp is DeliveryRouteWaypoint & { order: Order } => wp !== null);

    return {
      ...delivery,
      waypoints: populatedWaypoints,
    };
  }

  // Create a new delivery (metadata only)
  // Orders are added separately via DeliveryRouteWaypointsApi.addWaypoint()
  // For backward compatibility: if 'orders' is passed in delivery object, they will be added as waypoints
  async createDelivery(delivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> & { orders?: DeliveryRouteWaypoint[] }): Promise<DeliveryRoute> {
    await this.ensureInitialized();
    await new Promise((resolve) => setTimeout(resolve, 100));

    const now = new Date();
    const id = `DEL-${Date.now()}`;

    // Extract orders if provided (for backward compatibility)
    const { orders, ...deliveryData } = delivery;

    const newDelivery: DeliveryRoute = {
      ...deliveryData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.deliveries.push(newDelivery);

    // If orders were passed in, add them as waypoints for backward compatibility
    if (orders && Array.isArray(orders)) {
      for (const order of orders) {
        try {
          await DeliveryRouteWaypointsApi.addWaypoint(id, order.orderId, order.sequence);
        } catch {
          // Ignore duplicates
        }
      }
    }

    return { ...newDelivery };
  }

  // Update an existing delivery (metadata only)
  // To change orders, use DeliveryRouteWaypointsApi methods
  async updateDelivery(id: string, updates: Partial<DeliveryRoute>): Promise<DeliveryRoute | null> {
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

  // ====== DEPRECATED METHODS: Use DeliveryRouteWaypointsApi instead ======

  /**
   * @deprecated Use DeliveryRouteWaypointsApi.addWaypoint() instead
   * This method remains for backward compatibility during migration
   * Returns delivery with populated orders for backward compatibility
   */
  async addOrderToDelivery(
    deliveryId: string,
    orderId: string,
    atIndex?: number
  ): Promise<DeliveryRoute & { orders: DeliveryRouteWaypoint[] } | null> {
    const delivery = await this.getDelivery(deliveryId);
    if (!delivery) return null;

    // Delegate to waypoint API
    try {
      await DeliveryRouteWaypointsApi.addWaypoint(deliveryId, orderId, atIndex);
    } catch (e) {
      console.error('Error adding waypoint:', e);
    }

    // Return delivery with populated orders for backward compatibility
    const waypoints = await DeliveryRouteWaypointsApi.getWaypointsByDelivery(deliveryId);
    return {
      ...delivery,
      orders: waypoints,
    };
  }

  /**
   * @deprecated Use DeliveryRouteWaypointsApi.removeWaypoint() instead
   * This method remains for backward compatibility during migration
   * Returns delivery with populated orders for backward compatibility
   */
  async removeOrderFromDelivery(deliveryId: string, orderId: string): Promise<DeliveryRoute & { orders: DeliveryRouteWaypoint[] } | null> {
    const delivery = await this.getDelivery(deliveryId);
    if (!delivery) return null;

    // Delegate to waypoint API
    try {
      await DeliveryRouteWaypointsApi.removeWaypoint(deliveryId, orderId);
    } catch (e) {
      console.error('Error removing waypoint:', e);
    }

    // Return delivery with updated orders for backward compatibility
    const waypoints = await DeliveryRouteWaypointsApi.getWaypointsByDelivery(deliveryId);
    return {
      ...delivery,
      orders: waypoints,
    };
  }

  /**
   * @deprecated Use DeliveryRouteWaypointsApi.reorderWaypoints() instead
   * This method remains for backward compatibility during migration
   * Returns delivery with populated orders for backward compatibility
   */
  async reorderDeliveryOrders(
    deliveryId: string,
    fromIndex: number,
    toIndex: number
  ): Promise<DeliveryRoute & { orders: DeliveryRouteWaypoint[] } | null> {
    const delivery = await this.getDelivery(deliveryId);
    if (!delivery) return null;

    // Delegate to waypoint API
    try {
      await DeliveryRouteWaypointsApi.reorderWaypoints(deliveryId, fromIndex, toIndex);
    } catch (e) {
      console.error('Error reordering waypoints:', e);
    }

    // Return delivery with updated orders for backward compatibility
    const waypoints = await DeliveryRouteWaypointsApi.getWaypointsByDelivery(deliveryId);
    return {
      ...delivery,
      orders: waypoints,
    };
  }

  /**
   * @deprecated Use DeliveryRouteWaypointsApi.updateWaypointStatus() instead
   * This method remains for backward compatibility during migration
   * Returns delivery with populated orders for backward compatibility
   */
  async updateDeliveryOrderStatus(
    deliveryId: string,
    orderId: string,
    status: DeliveryRouteWaypoint['status'],
    deliveredAt?: Date,
    notes?: string
  ): Promise<DeliveryRoute & { orders: DeliveryRouteWaypoint[] } | null> {
    const delivery = await this.getDelivery(deliveryId);
    if (!delivery) return null;

    // Delegate to waypoint API
    try {
      await DeliveryRouteWaypointsApi.updateWaypointStatus(deliveryId, orderId, status, deliveredAt);

      // Update notes if provided
      if (notes) {
        await DeliveryRouteWaypointsApi.updateWaypoint(deliveryId, orderId, { notes });
      }
    } catch (e) {
      console.error('Error updating waypoint status:', e);
    }

    // Return delivery with populated orders for backward compatibility
    const waypoints = await DeliveryRouteWaypointsApi.getWaypointsByDelivery(deliveryId);
    return {
      ...delivery,
      orders: waypoints,
    };
  }

  // Update delivery status
  async updateDeliveryStatus(
    deliveryId: string,
    status: DeliveryRoute['status'],
    startedAt?: Date,
    completedAt?: Date
  ): Promise<DeliveryRoute | null> {
    const updates: Partial<DeliveryRoute> = { status };

    if (status === 'in-progress' && startedAt) {
      updates.startedAt = startedAt;
    }

    if (status === 'completed' && completedAt) {
      updates.completedAt = completedAt;
    }

    return this.updateDelivery(deliveryId, updates);
  }
}

export const DeliveryRoutesApi = new DeliveryRoutesApiClass();
