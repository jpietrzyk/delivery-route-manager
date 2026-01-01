import type { DeliveryRouteWaypoint } from '@/types/delivery';

// Mock delay to simulate network request
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Store for in-memory data that can be modified
let waypointsData: DeliveryRouteWaypoint[] = [];
let waypointsLoaded = false;

// Load and convert JSON data to DeliveryRouteWaypoint[]
async function loadWaypoints(): Promise<void> {
  if (waypointsLoaded) return;

  try {
    const response = await fetch('/delivery-route-waypoints-DEL-001.json');
    if (!response.ok) {
      throw new Error('Failed to load waypoints data');
    }

    const waypointsJson = await response.json();
    waypointsData = waypointsJson.map((waypoint: any) => ({
      orderId: waypoint.orderId,
      sequence: waypoint.sequence,
      status: waypoint.status || 'pending' as const,
      deliveredAt: waypoint.deliveredAt ? new Date(waypoint.deliveredAt) : undefined,
      notes: waypoint.notes,
      order: waypoint.order,
      driveTimeEstimate: waypoint.driveTimeEstimate,
      driveTimeActual: waypoint.driveTimeActual,
      arrivalTime: waypoint.arrivalTime ? new Date(waypoint.arrivalTime) : undefined,
      departureTime: waypoint.departureTime ? new Date(waypoint.departureTime) : undefined
    }));

    waypointsLoaded = true;
  } catch (error) {
    console.error('Failed to load waypoints:', error);
    throw error;
  }
}

export class DeliveryRouteWaypointsApi {
  /**
   * Reset the loaded state - useful for testing
   */
  static resetCache(): void {
    waypointsLoaded = false;
    waypointsData = [];
  }

  /**
   * Fetch all waypoints for a delivery route
   * In the future, this will make a real HTTP request to the backend
   */
  static async getWaypoints(): Promise<DeliveryRouteWaypoint[]> {
    await loadWaypoints();
    // Simulate network delay
    await mockDelay(500);

    // Return a copy of the data to prevent external mutations
    return waypointsData.map(waypoint => ({ ...waypoint }));
  }

  /**
   * Get a specific waypoint by order ID
   */
  static async getWaypointByOrderId(orderId: string): Promise<DeliveryRouteWaypoint | null> {
    await loadWaypoints();
    await mockDelay(300);

    const waypoint = waypointsData.find(wp => wp.orderId === orderId);
    return waypoint ? { ...waypoint } : null;
  }

  /**
   * Get waypoints for a specific delivery route
   */
  static async getWaypointsByDeliveryId(): Promise<DeliveryRouteWaypoint[]> {
    await loadWaypoints();
    await mockDelay(400);

    // Filter waypoints by delivery route ID (if available in data)
    // For now, return all as the mock data structure may be delivery-specific
    return waypointsData.map(waypoint => ({ ...waypoint }));
  }

  /**
   * Update waypoint status
   * Future: This will be a PUT/PATCH request to the backend
   */
  static async updateWaypointStatus(
    orderId: string,
    status: DeliveryRouteWaypoint['status']
  ): Promise<DeliveryRouteWaypoint | null> {
    await loadWaypoints();
    await mockDelay(400);

    const waypointIndex = waypointsData.findIndex(wp => wp.orderId === orderId);
    if (waypointIndex === -1) return null;

    const updatedWaypoint = {
      ...waypointsData[waypointIndex],
      status,
      deliveredAt: status === 'delivered' ? new Date() : undefined
    };

    // Update the in-memory data
    waypointsData[waypointIndex] = updatedWaypoint;

    return { ...updatedWaypoint };
  }

  /**
   * Update waypoint with timing information
   * Future: This will be a PUT/PATCH request to the backend
   */
  static async updateWaypointTiming(
    orderId: string,
    updates: Partial<Pick<DeliveryRouteWaypoint, 'arrivalTime' | 'departureTime' | 'driveTimeActual'>>
  ): Promise<DeliveryRouteWaypoint | null> {
    await loadWaypoints();
    await mockDelay(400);

    const waypointIndex = waypointsData.findIndex(wp => wp.orderId === orderId);
    if (waypointIndex === -1) return null;

    const updatedWaypoint = {
      ...waypointsData[waypointIndex],
      ...updates
    };

    // Update the in-memory data
    waypointsData[waypointIndex] = updatedWaypoint;

    return { ...updatedWaypoint };
  }

  /**
   * Update any waypoint fields
   * Future: This will be a PUT/PATCH request to the backend
   */
  static async updateWaypoint(
    orderId: string,
    updates: Partial<DeliveryRouteWaypoint>
  ): Promise<DeliveryRouteWaypoint | null> {
    await loadWaypoints();
    await mockDelay(400);

    const waypointIndex = waypointsData.findIndex(wp => wp.orderId === orderId);
    if (waypointIndex === -1) return null;

    const updatedWaypoint = {
      ...waypointsData[waypointIndex],
      ...updates,
      orderId // Ensure orderId doesn't change
    };

    // Update the in-memory data
    waypointsData[waypointIndex] = updatedWaypoint;

    return { ...updatedWaypoint };
  }
}
