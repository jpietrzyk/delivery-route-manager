import type { Order, Product } from "@/types/order";

// Mock delay to simulate network request
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Store for in-memory data that can be modified
let sampleOrdersData: Order[] = [];
let ordersLoaded = false;

// Load and convert JSON data to Order[] with proper Date objects
async function loadOrders(): Promise<void> {
  if (ordersLoaded) return;

  try {
    const response = await fetch('/orders.json');
    if (!response.ok) {
      throw new Error('Failed to load orders data');
    }

    const ordersJson = await response.json();
    sampleOrdersData = ordersJson.map((order: any) => ({
      id: order.id,
      product: order.product as Product,
      comment: order.comment,
      status: order.status as Order['status'],
      priority: order.priority as Order['priority'],
      active: order.active,
      deliveryId: order.deliveryId || undefined,
      createdAt: new Date(order.createdAt),
      updatedAt: new Date(order.updatedAt),
      customer: order.customer,
      totalAmount: order.totalAmount,
      items: order.items,
      location: order.location
    }));

    ordersLoaded = true;
  } catch (error) {
    console.error('Failed to load orders:', error);
    throw error;
  }
}

export class OrdersApi {
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
