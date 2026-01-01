/**
 * Tests for OrdersApi service
 */
import { OrdersApi } from '@/services/ordersApi';
import type { Order } from '@/types/order';

// Mock fetch globally
(globalThis as typeof globalThis).fetch = jest.fn();

describe('OrdersApi', () => {
  const mockOrdersData: Order[] = [
    {
      id: 'ORD-001',
      product: { name: 'Widget A', price: 100, complexity: 1 },
      comment: 'Urgent delivery',
      status: 'pending',
      priority: 'high',
      active: true,
      deliveryId: undefined,
      createdAt: new Date('2026-01-01T08:00:00'),
      updatedAt: new Date('2026-01-01T08:00:00'),
      customer: 'Customer A',
      totalAmount: 100,
      items: [],
      location: { lat: 51.5074, lng: -0.1278 }
    },
    {
      id: 'ORD-002',
      product: { name: 'Widget B', price: 200, complexity: 2 },
      comment: 'Standard delivery',
      status: 'pending',
      priority: 'medium',
      active: true,
      deliveryId: undefined,
      createdAt: new Date('2026-01-01T08:15:00'),
      updatedAt: new Date('2026-01-01T08:15:00'),
      customer: 'Customer B',
      totalAmount: 200,
      items: [],
      location: { lat: 51.5085, lng: -0.1250 }
    },
    {
      id: 'ORD-003',
      product: { name: 'Widget C', price: 150, complexity: 1 },
      comment: 'Low priority',
      status: 'pending',
      priority: 'low',
      active: false,
      deliveryId: undefined,
      createdAt: new Date('2026-01-01T08:30:00'),
      updatedAt: new Date('2026-01-01T08:30:00'),
      customer: 'Customer C',
      totalAmount: 150,
      items: [],
      location: { lat: 51.5100, lng: -0.1300 }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the API cache before each test
    OrdersApi.resetCache();
  });

  describe('getOrders', () => {
    it('should fetch and return only active orders', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const orders = await OrdersApi.getOrders();

      expect(orders).toHaveLength(2); // Only active orders
      expect(orders.every(order => order.active)).toBe(true);
      expect(orders[0].id).toBe('ORD-001');
      expect(orders[1].id).toBe('ORD-002');
    });

    it('should return a copy of orders data to prevent external mutations', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const orders1 = await OrdersApi.getOrders();
      const orders2 = await OrdersApi.getOrders();

      // Modify first copy
      orders1[0].status = 'completed';

      // Second copy should not be affected
      expect(orders2[0].status).toBe('pending');
    });

    it('should handle fetch errors gracefully', async () => {
      OrdersApi.resetCache();
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(OrdersApi.getOrders()).rejects.toThrow('Failed to load orders data');
    });
  });

  describe('getAllOrders', () => {
    it('should fetch and return all orders including inactive', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const orders = await OrdersApi.getAllOrders();

      expect(orders).toHaveLength(3); // All orders
      expect(orders.some(order => !order.active)).toBe(true);
    });

    it('should return a copy to prevent mutations', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const orders1 = await OrdersApi.getAllOrders();
      const orders2 = await OrdersApi.getAllOrders();

      orders1[0].status = 'completed';
      expect(orders2[0].status).toBe('pending');
    });
  });

  describe('getOrderById', () => {
    it('should return an active order by ID', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const order = await OrdersApi.getOrderById('ORD-001');

      expect(order).toBeDefined();
      expect(order?.id).toBe('ORD-001');
      expect(order?.customer).toBe('Customer A');
    });

    it('should return null for inactive orders', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const order = await OrdersApi.getOrderById('ORD-003'); // inactive

      expect(order).toBeNull();
    });

    it('should return null if order is not found', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const order = await OrdersApi.getOrderById('ORD-999');

      expect(order).toBeNull();
    });

    it('should return a copy of the order', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const order1 = await OrdersApi.getOrderById('ORD-001');
      const order2 = await OrdersApi.getOrderById('ORD-001');

      if (order1 && order2) {
        order1.status = 'completed';
        expect(order2.status).toBe('pending');
      }
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const updatedOrder = await OrdersApi.updateOrderStatus('ORD-001', 'in-progress');

      expect(updatedOrder).toBeDefined();
      expect(updatedOrder?.status).toBe('in-progress');
      expect(updatedOrder?.updatedAt instanceof Date).toBe(true);
    });

    it('should update the updatedAt timestamp', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const originalUpdatedAt = new Date('2026-01-01T08:00:00');
      const updatedOrder = await OrdersApi.updateOrderStatus('ORD-001', 'completed');

      expect(updatedOrder?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should return null if order is not found', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const updatedOrder = await OrdersApi.updateOrderStatus('ORD-999', 'completed');

      expect(updatedOrder).toBeNull();
    });
  });

  describe('updateOrderActiveStatus', () => {
    it('should update order active status', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const updatedOrder = await OrdersApi.updateOrderActiveStatus('ORD-001', false);

      expect(updatedOrder?.active).toBe(false);
    });

    it('should set updated timestamp', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const beforeUpdate = new Date();
      const updatedOrder = await OrdersApi.updateOrderActiveStatus('ORD-002', false);
      const afterUpdate = new Date();

      expect(updatedOrder?.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
      expect(updatedOrder?.updatedAt.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
    });

    it('should return null if order is not found', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const updatedOrder = await OrdersApi.updateOrderActiveStatus('ORD-999', false);

      expect(updatedOrder).toBeNull();
    });
  });

  describe('updateOrder', () => {
    it('should update multiple order fields', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const updatedOrder = await OrdersApi.updateOrder('ORD-001', {
        status: 'completed',
        comment: 'Delivered successfully',
        priority: 'low'
      });

      expect(updatedOrder?.status).toBe('completed');
      expect(updatedOrder?.comment).toBe('Delivered successfully');
      expect(updatedOrder?.priority).toBe('low');
    });

    it('should preserve the order ID during update', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const updatedOrder = await OrdersApi.updateOrder('ORD-001', {
        id: 'ORD-999', // Attempt to change ID
        status: 'completed'
      });

      expect(updatedOrder?.id).toBe('ORD-001'); // ID should remain unchanged
    });

    it('should update the updatedAt timestamp', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const beforeUpdate = new Date();
      const updatedOrder = await OrdersApi.updateOrder('ORD-001', {
        status: 'in-progress'
      });
      const afterUpdate = new Date();

      expect(updatedOrder?.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
      expect(updatedOrder?.updatedAt.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
    });

    it('should return null if order is not found', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const updatedOrder = await OrdersApi.updateOrder('ORD-999', {
        status: 'completed'
      });

      expect(updatedOrder).toBeNull();
    });
  });

  describe('Date handling', () => {
    it('should properly convert date strings to Date objects', async () => {
      const dataWithDates = [
        {
          ...mockOrdersData[0],
          createdAt: '2026-01-01T08:00:00',
          updatedAt: '2026-01-01T08:00:00'
        }
      ];

      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => dataWithDates
      });

      const orders = await OrdersApi.getOrders();

      expect(orders[0].createdAt instanceof Date).toBe(true);
      expect(orders[0].updatedAt instanceof Date).toBe(true);
    });
  });

  describe('Data persistence', () => {
    it('should persist data across multiple calls', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      // First call loads data
      await OrdersApi.getOrders();

      // Second call should use cached data (fetch should only be called once)
      await OrdersApi.getOrders();

      expect((globalThis.fetch as jest.Mock).mock.calls).toHaveLength(1);
    });

    it('should update persisted data when order is modified', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      // Load orders
      const ordersBefore = await OrdersApi.getOrders();
      expect(ordersBefore[0].status).toBe('pending');

      // Update order
      await OrdersApi.updateOrderStatus('ORD-001', 'completed');

      // Get orders again (no new fetch)
      const ordersAfter = await OrdersApi.getOrders();
      expect(ordersAfter[0].status).toBe('completed');
    });
  });
});
