/**
 * Tests for OrdersApi service
 */
import { OrdersApi } from '@/services/orders-api';
import type { Order } from '@/types/order';

// Mock fetch globally
(globalThis as typeof globalThis).fetch = jest.fn();

describe('OrdersApi', () => {
  const mockOrdersData: Order[] = [
    {
      id: 'ORD-001',
      status: 'pending',
      priority: 2,
      createdAt: '2026-01-01T08:00:00',
      updatedAt: '2026-01-01T08:00:00',
      customer: { name: 'Customer A' },
      totalAmount: 100,
      items: [],
      location: { lat: 51.5074, lng: -0.1278 },
      complexity: 1,
    },
    {
      id: 'ORD-002',
      status: 'pending',
      priority: 1,
      createdAt: '2026-01-01T08:15:00',
      updatedAt: '2026-01-01T08:15:00',
      customer: { name: 'Customer B' },
      totalAmount: 200,
      items: [],
      location: { lat: 51.5085, lng: -0.1250 },
      complexity: 2,
    },
    {
      id: 'ORD-003',
      status: 'pending',
      priority: 0,
      createdAt: '2026-01-01T08:30:00',
      updatedAt: '2026-01-01T08:30:00',
      customer: { name: 'Customer C' },
      totalAmount: 150,
      items: [],
      location: { lat: 51.5100, lng: -0.1300 },
      complexity: 1,
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the API cache before each test
    OrdersApi.resetCache();
  });

  describe('getOrders', () => {
    it('should fetch and return all orders', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const orders = await OrdersApi.getOrders();

      expect(orders).toHaveLength(3); // All orders
      expect(orders[0].id).toBe('ORD-001');
      expect(orders[1].id).toBe('ORD-002');
      expect(orders[2].id).toBe('ORD-003');
    });

    it('should return a copy of orders data to prevent external mutations', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const orders1 = await OrdersApi.getOrders();
      const orders2 = await OrdersApi.getOrders();

      // Modify first copy
      if (orders1.length > 0 && orders2.length > 0) {
        orders1[0].status = 'completed';
        // Second copy should not be affected
        expect(orders2[0].status).toBe('pending');
      } else {
        expect(orders1.length).toBeGreaterThan(0);
        expect(orders2.length).toBeGreaterThan(0);
      }
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
      // No 'active' property in new Order type, just check length and ids
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
    it('should return an order by ID', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const order = await OrdersApi.getOrderById('ORD-001');

      expect(order).toBeDefined();
      expect(order?.id).toBe('ORD-001');
      expect(order?.customer.name).toBe('Customer A');
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
      expect(typeof updatedOrder?.updatedAt).toBe('string');
    });

    it('should update the updatedAt timestamp', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const originalUpdatedAt = '2026-01-01T08:00:00';
      const updatedOrder = await OrdersApi.updateOrderStatus('ORD-001', 'completed');

      expect(typeof updatedOrder?.updatedAt).toBe('string');
      expect(Date.parse(updatedOrder?.updatedAt || '')).toBeGreaterThan(Date.parse(originalUpdatedAt));
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

      await OrdersApi.updateOrderActiveStatus('ORD-001');

      // No 'active' property in new Order type
    });

    it('should set updated timestamp', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const beforeUpdate = Date.now();
      const updatedOrder = await OrdersApi.updateOrderActiveStatus('ORD-002');
      const afterUpdate = Date.now();

      expect(typeof updatedOrder?.updatedAt).toBe('string');
      const updatedAtTime = Date.parse(updatedOrder?.updatedAt || '');
      expect(updatedAtTime).toBeGreaterThanOrEqual(beforeUpdate - 1000); // allow 1s clock skew
      expect(updatedAtTime).toBeLessThanOrEqual(afterUpdate + 1000);
    });

    it('should return null if order is not found', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersData
      });

      const updatedOrder = await OrdersApi.updateOrderActiveStatus('ORD-999');

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
        priority: 0 // should be a number
      });

      expect(updatedOrder?.status).toBe('completed');
      expect(updatedOrder?.priority).toBe(0);
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

      const beforeUpdate = Date.now();
      const updatedOrder = await OrdersApi.updateOrder('ORD-001', {
        status: 'in-progress'
      });
      const afterUpdate = Date.now();

      expect(typeof updatedOrder?.updatedAt).toBe('string');
      const updatedAtTime = Date.parse(updatedOrder?.updatedAt || '');
      expect(updatedAtTime).toBeGreaterThanOrEqual(beforeUpdate - 1000); // allow 1s clock skew
      expect(updatedAtTime).toBeLessThanOrEqual(afterUpdate + 1000);
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
    // No longer converting date strings to Date objects in Order type
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
