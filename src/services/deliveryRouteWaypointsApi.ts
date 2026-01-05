import type { DeliveryRouteWaypoint } from '@/types/delivery-route';
import { sampleDeliveryWaypoints } from '@/types/delivery-route';
import { resequenceWaypoints } from '@/lib/delivery-route-waypoint-helpers';

// Store for in-memory data that can be modified
// Key: deliveryId, Value: array of waypoints for that delivery
const waypointsData: Map<string, DeliveryRouteWaypoint[]> = new Map();
let waypointsLoaded = false;
let loadingPromise: Promise<void> | null = null;

/**
 * Load waypoints from JSON file (browser) or use sample data (Node.js/tests)
 * Returns a promise that resolves when data is loaded
 */
async function loadWaypoints(): Promise<void> {
  if (waypointsLoaded) {
    console.log('Waypoints already loaded, returning cached data');
    return;
  }

  // If already loading, return the existing promise
  if (loadingPromise) {
    console.log('Waypoints loading in progress, waiting...');
    return loadingPromise;
  }

  console.log('Starting waypoints loading...');
  loadingPromise = (async () => {
    try {
      // Check if we're in a test environment (Jest)
      const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV;
      const isTestEnv = nodeEnv === 'test';

      // Check if we're in a browser environment (fetch is available) and NOT in tests
      if (!isTestEnv && typeof fetch !== 'undefined' && typeof window !== 'undefined') {
        console.log('Browser environment detected, fetching JSON...');
        try {
          const response = await fetch('/delivery-route-waypoints-DEL-001.json');
          console.log('Fetch response:', response.status, response.ok);
          if (response.ok) {
            const data = (await response.json()) as DeliveryRouteWaypoint[];
            console.log('JSON parsed, data:', data);
            if (data && Array.isArray(data)) {
              // Load data from JSON file
              waypointsData.clear();
              const deliveryId = 'DEL-001';
              waypointsData.set(
                deliveryId,
                data.map((wp) => ({
                  ...wp,
                  deliveryId,
                }))
              );
              console.log(`✅ Loaded ${data.length} waypoints for delivery ${deliveryId} from JSON`);
              waypointsLoaded = true;
              return;
            } else {
              console.warn('JSON data is not an array:', data);
            }
          } else {
            console.warn('Fetch failed with status:', response.status);
          }
          // If fetch failed, fall through to sample data
          console.warn('❌ Failed to load waypoints from JSON, using sample data');
        } catch (error) {
          console.error('❌ Error loading waypoints from JSON:', error);
          // Fall through to sample data
        }
      } else {
        console.log('Test environment or no fetch available, using sample data');
      }

      // Fallback: use sample data (for tests or if fetch failed)
      console.log('Loading sample data (10 waypoints)...');
      loadSampleData();
      waypointsLoaded = true;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

/**
 * Load sample waypoints into the in-memory store
 */
function loadSampleData(): void {
  waypointsData.clear();
  for (const waypoint of sampleDeliveryWaypoints) {
    if (!waypoint.deliveryId) continue;

    const deliveryId = waypoint.deliveryId;

    if (!waypointsData.has(deliveryId)) {
      waypointsData.set(deliveryId, []);
    }
    waypointsData.get(deliveryId)!.push({ ...waypoint, deliveryId });
  }
}

export class DeliveryRouteWaypointsApi {
  /**
   * Reset the loaded state - useful for testing
   */
  static resetCache(): void {
    waypointsLoaded = false;
    waypointsData.clear();
    loadingPromise = null;
  }

  /**
   * Get waypoints for a specific delivery
   *
   * @param deliveryId - ID of the delivery
   * @returns Waypoints in sequence order
   */
  static async getWaypointsByDelivery(deliveryId: string): Promise<DeliveryRouteWaypoint[]> {
    await loadWaypoints();

    const waypoints = waypointsData.get(deliveryId) || [];
    return waypoints
      .sort((a, b) => a.sequence - b.sequence)
      .map(waypoint => ({ ...waypoint }));
  }

  /**
   * Get all deliveries containing a specific order
   *
   * @param orderId - ID of the order to find
   * @returns Array of delivery IDs containing this order
   */
  static async getDeliveriesForOrder(orderId: string): Promise<string[]> {
    await loadWaypoints();

    const deliveries: string[] = [];
    for (const [deliveryId, waypoints] of waypointsData.entries()) {
      if (waypoints.some(w => w.orderId === orderId)) {
        deliveries.push(deliveryId);
      }
    }
    return deliveries;
  }

  /**
   * Add a waypoint (order to delivery) at a specific position
   *
   * @param deliveryId - ID of the delivery
   * @param orderId - ID of the order to add
   * @param atIndex - Optional position to insert (defaults to end)
   * @returns Created waypoint
   */
  static async addWaypoint(
    deliveryId: string,
    orderId: string,
    atIndex?: number
  ): Promise<DeliveryRouteWaypoint> {
    await loadWaypoints();

    if (!waypointsData.has(deliveryId)) {
      waypointsData.set(deliveryId, []);
    }

    const deliveryWaypoints = waypointsData.get(deliveryId)!;

    // Check if order already exists in this delivery
    if (deliveryWaypoints.some(w => w.orderId === orderId)) {
      throw new Error(`Order ${orderId} already exists in delivery ${deliveryId}`);
    }

    const newWaypoint: DeliveryRouteWaypoint = {
      deliveryId,
      orderId,
      sequence: atIndex ?? deliveryWaypoints.length,
      status: 'pending',
    };

    // Insert at position or append
    if (atIndex !== undefined && atIndex >= 0 && atIndex <= deliveryWaypoints.length) {
      deliveryWaypoints.splice(atIndex, 0, newWaypoint);
    } else {
      deliveryWaypoints.push(newWaypoint);
    }

    // Resequence all waypoints
    const resequenced = resequenceWaypoints(deliveryWaypoints);
    waypointsData.set(deliveryId, resequenced);

    return { ...newWaypoint };
  }

  /**
   * Remove a waypoint (order from delivery)
   *
   * @param deliveryId - ID of the delivery
   * @param orderId - ID of the order to remove
   * @returns true if successful, throws on error
   */
  static async removeWaypoint(deliveryId: string, orderId: string): Promise<void> {
    await loadWaypoints();

    const deliveryWaypoints = waypointsData.get(deliveryId);
    if (!deliveryWaypoints) {
      throw new Error(`Delivery ${deliveryId} not found`);
    }

    const index = deliveryWaypoints.findIndex(w => w.orderId === orderId);
    if (index === -1) {
      throw new Error(`Order ${orderId} not found in delivery ${deliveryId}`);
    }

    // Remove the waypoint
    deliveryWaypoints.splice(index, 1);

    // Resequence remaining waypoints
    const resequenced = resequenceWaypoints(deliveryWaypoints);
    waypointsData.set(deliveryId, resequenced);
  }

  /**
   * Reorder waypoints (move order to different position)
   *
   * @param deliveryId - ID of the delivery
   * @param fromIndex - Current position
   * @param toIndex - New position
   * @returns Updated waypoints in sequence
   */
  static async reorderWaypoints(
    deliveryId: string,
    fromIndex: number,
    toIndex: number
  ): Promise<DeliveryRouteWaypoint[]> {
    await loadWaypoints();

    const deliveryWaypoints = waypointsData.get(deliveryId);
    if (!deliveryWaypoints) {
      throw new Error(`Delivery ${deliveryId} not found`);
    }

    // Sort by current sequence to get proper order
    const sorted = [...deliveryWaypoints].sort((a, b) => a.sequence - b.sequence);

    if (fromIndex < 0 || fromIndex >= sorted.length || toIndex < 0 || toIndex >= sorted.length) {
      throw new Error('Invalid fromIndex or toIndex');
    }

    // Move item
    const [moved] = sorted.splice(fromIndex, 1);
    sorted.splice(toIndex, 0, moved);

    // Resequence
    const resequenced = resequenceWaypoints(sorted);
    waypointsData.set(deliveryId, resequenced);

    return [...resequenced];
  }

  /**
   * Update waypoint status
   *
   * @param deliveryId - ID of the delivery
   * @param orderId - ID of the order
   * @param status - New status
   * @param deliveredAt - Optional delivery timestamp
   * @returns Updated waypoint or null if not found
   */
  static async updateWaypointStatus(
    deliveryId: string,
    orderId: string,
    status: DeliveryRouteWaypoint['status'],
    deliveredAt?: Date
  ): Promise<DeliveryRouteWaypoint | null> {
    await loadWaypoints();

    const deliveryWaypoints = waypointsData.get(deliveryId);
    if (!deliveryWaypoints) {
      return null;
    }

    const waypoint = deliveryWaypoints.find(w => w.orderId === orderId);
    if (!waypoint) {
      return null;
    }

    waypoint.status = status;
    if (status === 'delivered') {
      waypoint.deliveredAt = deliveredAt ?? new Date();
    }

    return { ...waypoint };
  }

  /**
   * Update any waypoint fields
   *
   * @param deliveryId - ID of the delivery
   * @param orderId - ID of the order
   * @param updates - Fields to update (excluding deliveryId and orderId which cannot be changed)
   * @returns Updated waypoint or null if not found
   */
  static async updateWaypoint(
    deliveryId: string,
    orderId: string,
    updates: Partial<Omit<DeliveryRouteWaypoint, 'deliveryId' | 'orderId' | 'sequence'>>
  ): Promise<DeliveryRouteWaypoint | null> {
    await loadWaypoints();

    const deliveryWaypoints = waypointsData.get(deliveryId);
    if (!deliveryWaypoints) {
      return null;
    }

    const waypoint = deliveryWaypoints.find(w => w.orderId === orderId);
    if (!waypoint) {
      return null;
    }

    // Remove orderId and deliveryId from updates if they were passed (prevent override attempts)
    const safeUpdates: Partial<DeliveryRouteWaypoint> = { ...updates };
    delete safeUpdates.orderId;
    delete safeUpdates.deliveryId;

    Object.assign(waypoint, safeUpdates);
    return { ...waypoint };
  }

  /**
   * Get a specific waypoint
   *
   * @param deliveryId - ID of the delivery
   * @param orderId - ID of the order
   * @returns The waypoint or null if not found
   */
  static async getWaypoint(deliveryId: string, orderId: string): Promise<DeliveryRouteWaypoint | null> {
    await loadWaypoints();

    const deliveryWaypoints = waypointsData.get(deliveryId);
    if (!deliveryWaypoints) return null;

    const waypoint = deliveryWaypoints.find(w => w.orderId === orderId);
    return waypoint ? { ...waypoint } : null;
  }
}
