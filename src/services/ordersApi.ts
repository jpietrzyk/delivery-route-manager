import type { Order } from "@/types/order";
import ordersJson from "@/assets/orders.json";

// Mock delay to simulate network request
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Convert JSON data to Order[] with proper Date objects
const sampleOrdersData: Order[] = ordersJson.map(order => ({
  id: order.id,
  name: order.name,
  comment: order.comment,
  status: order.status as Order['status'],
  priority: order.priority as Order['priority'],
  active: order.active,
  createdAt: new Date(order.createdAt),
  updatedAt: new Date(order.updatedAt),
  customer: order.customer,
  totalAmount: order.totalAmount,
  items: order.items,
  location: order.location
}));

/**
 * Mock API service for orders
 *
 * This service currently simulates a real API endpoint but returns static data.
 * It's designed to be easily replaceable with actual HTTP requests when a real
 * backend becomes available.
 *
 * FUTURE IMPLEMENTATION:
 * - Replace mockDelay with actual HTTP requests using fetch/axios
 * - Add proper error handling for network failures
 * - Implement request cancellation for better user experience
 * - Add request/response interceptors for authentication, logging, etc.
 * - Implement caching strategies if needed
 *
 * USAGE:
 * Current: OrdersApi.getOrders() // Returns mock data
 * Future:   fetch('/api/orders').then(res => res.json()) // Real HTTP request
 */
export class OrdersApi {
  /**
   * Fetch all orders
   * In the future, this will make a real HTTP request to the backend
   */
  static async getOrders(): Promise<Order[]> {
    // Simulate network delay
    await mockDelay(500);

    // Return a copy of the data to prevent external mutations, filtering out inactive orders
    return sampleOrdersData.filter(order => order.active).map(order => ({ ...order }));
  }

  /**
   * Fetch all orders (including inactive)
   */
  static async getAllOrders(): Promise<Order[]> {
    // Simulate network delay
    await mockDelay(500);

    // Return a copy of all data
    return sampleOrdersData.map(order => ({ ...order }));
  }

  /**
   * Get a specific order by ID
   */
  static async getOrderById(id: string): Promise<Order | null> {
    await mockDelay(300);

    const order = sampleOrdersData.find(order => order.id === id && order.active);
    return order ? { ...order } : null;
  }

  /**
   * Mock method for updating an order status
   * Future: This will be a PUT/PATCH request to the backend
   */
  static async updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
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
}
