import type { Order, Product } from "@/types/order";

// Mock delay to simulate network request
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Store for in-memory data that can be modified
let sampleOrdersData: Order[] = [];
let ordersLoaded = false;

// In-flight request deduplication - prevents multiple concurrent fetches
let loadOrdersPromise: Promise<void> | null = null;

// Load and convert JSON data to Order[] with proper Date objects
async function loadOrders(): Promise<void> {
  // If already loaded, return immediately
  if (ordersLoaded) {
    console.log("[OrdersApi] Orders already cached, skipping fetch");
    return;
  }

  // If a request is already in flight, wait for it
  if (loadOrdersPromise) {
    console.log("[OrdersApi] Request already in flight, waiting for it to complete");
    return loadOrdersPromise;
  }

  // Create the promise and store it for deduplication
  console.log("[OrdersApi] Starting orders fetch (deduplication enabled)");
  loadOrdersPromise = (async () => {
    try {
      const url = "/.netlify/functions/orders"; // Netlify function handles ApiDog fallback to local mock
      const headers: Record<string, string> = {
        "Accept": "application/json",
        "Content-Type": "application/json"
      };

      // Debug: log the request details
      console.log("Fetching orders from:", url);

      const response = await fetch(url, { method: "GET", headers });
      if (!response.ok) {
        throw new Error('Failed to load orders data');
      }

      const ordersJson = (await response.json()) as Order[];
      sampleOrdersData = ordersJson.map((order) => {
        const orderRecord = order as unknown as Record<string, unknown>;
        return {
          id: order.id,
          product: order.product as Product,
          comment: order.comment,
          status: (order.status === 'cancelled' ? 'cancelled' : order.status) as Order['status'],
          priority: order.priority as Order['priority'],
          active: order.active !== false, // Default to true if missing
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
          customer: order.customer,
          totalAmount: (orderRecord.totalAmount as number) ?? (orderRecord.totalamount as number) ?? 0,
          items: order.items,
          location: {
            lat: typeof order.location.lat === 'string' ? parseFloat(order.location.lat) : order.location.lat,
            lng: typeof order.location.lng === 'string' ? parseFloat(order.location.lng) : order.location.lng
          }
        };
      });

      ordersLoaded = true;
    } catch (error) {
      console.error('Failed to load orders:', error);
      throw error;
    } finally {
      // Clear the in-flight promise
      loadOrdersPromise = null;
    }
  })();

  return loadOrdersPromise;
}

export class OrdersApi {
  /**
   * Reset the loaded state - useful for testing
   */
  static resetCache(): void {
    ordersLoaded = false;
    sampleOrdersData = [];
  }

  /**
   * Fetch all orders
   * In the future, this will make a real HTTP request to the backend
   */
  static async getOrders(): Promise<Order[]> {
    await loadOrders();
    // Simulate network delay
    await mockDelay(500);

    // Return a copy of the data to prevent external mutations, filtering out inactive orders
    return sampleOrdersData.filter(order => order.active).map(order => ({ ...order }));
  }

  /**
   * Fetch all orders (including inactive)
   */
  static async getAllOrders(): Promise<Order[]> {
    await loadOrders();
    // Simulate network delay
    await mockDelay(500);

    // Return a copy of all data
    return sampleOrdersData.map(order => ({ ...order }));
  }

  /**
   * Get a specific order by ID
   */
  static async getOrderById(id: string): Promise<Order | null> {
    await loadOrders();
    await mockDelay(300);

    const order = sampleOrdersData.find(order => order.id === id && order.active);
    return order ? { ...order } : null;
  }

  /**
   * Mock method for updating an order status
   * Future: This will be a PUT/PATCH request to the backend
   */
  static async updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
    await loadOrders();
    await mockDelay(400);

    const orderIndex = sampleOrdersData.findIndex(order => order.id === id);
    if (orderIndex === -1) return null;

    const updatedOrder = {
      ...sampleOrdersData[orderIndex],
      status,
      updatedAt: new Date()
    };

    // Update the in-memory data
    sampleOrdersData[orderIndex] = updatedOrder;

    return { ...updatedOrder };
  }

  /**
   * Mock method for updating an order's active status
   * Future: This will be a PUT/PATCH request to the backend
   */
  static async updateOrderActiveStatus(id: string, active: boolean): Promise<Order | null> {
    await loadOrders();
    await mockDelay(400);

    const orderIndex = sampleOrdersData.findIndex(order => order.id === id);
    if (orderIndex === -1) return null;

    const updatedOrder = {
      ...sampleOrdersData[orderIndex],
      active,
      updatedAt: new Date()
    };

    // Update the in-memory data
    sampleOrdersData[orderIndex] = updatedOrder;

    return { ...updatedOrder };
  }

  /**
   * Mock method for updating any order fields
   * Future: This will be a PUT/PATCH request to the backend
   */
  static async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    await loadOrders();
    await mockDelay(400);

    const orderIndex = sampleOrdersData.findIndex(order => order.id === id);
    if (orderIndex === -1) return null;

    const updatedOrder = {
      ...sampleOrdersData[orderIndex],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date()
    };

    // Update the in-memory data
    sampleOrdersData[orderIndex] = updatedOrder;

    return { ...updatedOrder };
  }
}
