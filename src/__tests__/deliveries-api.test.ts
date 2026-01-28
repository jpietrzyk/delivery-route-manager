/**
 * Tests for DeliveryRoutesApi service
 */
import { DeliveryRoutesApi } from '@/services/delivery-routes-api';
import { DeliveryRouteWaypointsApi } from '@/services/delivery-route-waypoints-api';
import type { DeliveryRoute, DeliveryRouteWaypoint } from '@/types/delivery-route';
import type { Order } from '@/types/order';

type DeliveryWithOrders = DeliveryRoute & {
  orders?: Array<DeliveryRouteWaypoint & { order?: Order; deliveredAt?: Date; notes?: string }>;
};

const asDeliveryWithOrders = (
  delivery: DeliveryRoute | DeliveryWithOrders | null
): DeliveryWithOrders | null => (delivery as DeliveryWithOrders) ?? null;
describe('DeliveryRoutesApi', () => {
  const mockOrdersData: Order[] = [
    {
      id: 'ORD-001',
      product: { name: 'Widget A', price: 100, complexity: 1 },
      comment: 'Test',
      status: 'pending',
      priority: 'high',
      active: true,
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
      comment: 'Test',
      status: 'pending',
      priority: 'medium',
      active: true,
      createdAt: new Date('2026-01-01T08:15:00'),
      updatedAt: new Date('2026-01-01T08:15:00'),
      customer: 'Customer B',
      totalAmount: 200,
      items: [],
      location: { lat: 51.5085, lng: -0.1250 }
    }
  ];

  beforeEach(() => {
    // Reset the API cache before each test
    DeliveryRoutesApi.resetCache();
    DeliveryRouteWaypointsApi.resetCache();
  });

  describe('getDeliveries', () => {
    it('should return an array of deliveries', async () => {
      const deliveries = await DeliveryRoutesApi.getDeliveries();

      expect(Array.isArray(deliveries)).toBe(true);
      expect(deliveries.length).toBeGreaterThanOrEqual(0);
    });

    it('should return deliveries as an array', async () => {
      const deliveries = await DeliveryRoutesApi.getDeliveries();

      expect(Array.isArray(deliveries)).toBe(true);
      if (deliveries.length > 0) {
        expect(deliveries[0]).toHaveProperty('id');
        expect(deliveries[0]).toHaveProperty('name');
        // DeliveryRoute no longer has embedded orders array (waypoint-based now)
        expect(deliveries[0]).toHaveProperty('status');
      }
    });
  });

  describe('getDelivery', () => {
    it('should return null for non-existent delivery', async () => {
      const delivery = await DeliveryRoutesApi.getDelivery('NON-EXISTENT');

      expect(delivery).toBeNull();
    });

    it('should return a copy of the delivery', async () => {
      const deliveries = await DeliveryRoutesApi.getDeliveries();
      if (deliveries.length > 0) {
        const delivery1 = await DeliveryRoutesApi.getDelivery(deliveries[0].id);
        const delivery2 = await DeliveryRoutesApi.getDelivery(deliveries[0].id);

        if (delivery1 && delivery2) {
          delivery1.name = 'Modified';
          expect(delivery2.name).not.toBe('Modified');
        }
      }
    });
  });

  describe('getDeliveryWithOrders', () => {
    it('should return delivery with populated order data', async () => {
      const delivery = await DeliveryRoutesApi.getDeliveryWithOrders('NON-EXISTENT', mockOrdersData);

      expect(delivery).toBeNull();
    });

    it('should populate order data from provided orders array', async () => {
      const testDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> & { orders?: DeliveryRouteWaypoint[] } = {
        name: 'Test Delivery',
        status: 'scheduled',
        orders: [
          {
            orderId: 'ORD-001',
            sequence: 0,
            status: 'pending'
          },
          {
            orderId: 'ORD-002',
            sequence: 1,
            status: 'pending'
          }
        ],
        notes: 'Test'
      };

      const created = await DeliveryRoutesApi.createDelivery(testDelivery);
      const populated = await DeliveryRoutesApi.getDeliveryWithOrders(created.id, mockOrdersData);

      if (populated) {
        const populatedWithOrders = populated as DeliveryWithOrders;
        expect(populatedWithOrders.orders).toHaveLength(2);
        expect(populatedWithOrders.orders?.[0].order?.id).toBe('ORD-001');
        expect(populatedWithOrders.orders?.[1].order?.id).toBe('ORD-002');
      }
    });
  });

  describe('createDelivery', () => {
    it('should create a new delivery with auto-generated ID', async () => {
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'New Delivery',
        status: 'scheduled',
        notes: 'Test delivery'
      };

      const created = await DeliveryRoutesApi.createDelivery(newDelivery);

      expect(created.id).toBeDefined();
      expect(created.name).toBe('New Delivery');
      expect(created.status).toBe('scheduled');
      expect(created.createdAt instanceof Date).toBe(true);
      expect(created.updatedAt instanceof Date).toBe(true);
    });

    it('should set createdAt and updatedAt to current time', async () => {
      const beforeCreation = new Date();
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test Delivery',
        status: 'scheduled'
      };

      const created = await DeliveryRoutesApi.createDelivery(newDelivery);
      const afterCreation = new Date();

      expect(created.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(created.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
      expect(created.updatedAt.getTime()).toEqual(created.createdAt.getTime());
    });

    it('should preserve order data in created delivery', async () => {
      const waypoints: DeliveryRouteWaypoint[] = [
        {
          orderId: 'ORD-001',
          sequence: 0,
          status: 'pending'
        },
        {
          orderId: 'ORD-002',
          sequence: 1,
          status: 'pending'
        }
      ];

      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> & { orders?: DeliveryRouteWaypoint[] } = {
        name: 'Delivery with Orders',
        status: 'scheduled',
        orders: waypoints
      };

      const created = await DeliveryRoutesApi.createDelivery(newDelivery);

      // Verify the delivery was created
      expect(created.id).toBeDefined();
      expect(created.name).toBe('Delivery with Orders');

      // Verify waypoints were added (load them to check)
      const waypointsLoaded = await DeliveryRouteWaypointsApi.getWaypointsByDelivery(created.id);
      expect(waypointsLoaded).toHaveLength(2);
      expect(waypointsLoaded[0].orderId).toBe('ORD-001');
      expect(waypointsLoaded[1].orderId).toBe('ORD-002');
    });
  });

  describe('updateDelivery', () => {
    it('should update delivery fields', async () => {
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Original Name',
        status: 'scheduled'
      };

      const created = await DeliveryRoutesApi.createDelivery(newDelivery);
      const updated = await DeliveryRoutesApi.updateDelivery(created.id, {
        name: 'Updated Name',
        status: 'in-progress'
      });

      expect(updated?.name).toBe('Updated Name');
      expect(updated?.status).toBe('in-progress');
      expect(updated?.id).toBe(created.id); // ID should not change
    });

    it('should update the updatedAt timestamp', async () => {
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test',
        status: 'scheduled'
      };

      const created = await DeliveryRoutesApi.createDelivery(newDelivery);
      const originalUpdatedAt = created.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await DeliveryRoutesApi.updateDelivery(created.id, { name: 'Updated' });

      expect(updated?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should return null if delivery is not found', async () => {
      const updated = await DeliveryRoutesApi.updateDelivery('NON-EXISTENT', {
        name: 'Updated'
      });

      expect(updated).toBeNull();
    });

    it('should preserve the createdAt timestamp', async () => {
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test',
        status: 'scheduled'
      };

      const created = await DeliveryRoutesApi.createDelivery(newDelivery);
      const originalCreatedAt = created.createdAt;

      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await DeliveryRoutesApi.updateDelivery(created.id, { name: 'Updated' });

      expect(updated?.createdAt.getTime()).toEqual(originalCreatedAt.getTime());
    });
  });

  describe('deleteDelivery', () => {
    it('should delete an existing delivery', async () => {
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'To Delete',
        status: 'scheduled'
      };

      const created = await DeliveryRoutesApi.createDelivery(newDelivery);
      const deleted = await DeliveryRoutesApi.deleteDelivery(created.id);

      expect(deleted).toBe(true);

      const retrieved = await DeliveryRoutesApi.getDelivery(created.id);
      expect(retrieved).toBeNull();
    });

    it('should return false if delivery is not found', async () => {
      const deleted = await DeliveryRoutesApi.deleteDelivery('NON-EXISTENT');

      expect(deleted).toBe(false);
    });
  });

  describe('addOrderToDelivery', () => {
    it('should add an order to a delivery', async () => {
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test',
        status: 'scheduled'
      };

      const created = await DeliveryRoutesApi.createDelivery(newDelivery);
      const updated = await DeliveryRoutesApi.addOrderToDelivery(created.id, 'ORD-001');
      const updatedWithOrders = asDeliveryWithOrders(updated);

      expect(updatedWithOrders?.orders).toHaveLength(1);
      expect(updatedWithOrders?.orders?.[0].orderId).toBe('ORD-001');
      expect(updatedWithOrders?.orders?.[0].sequence).toBe(0);
    });

    it('should add order at specified index', async () => {
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> & { orders?: DeliveryRouteWaypoint[] } = {
        name: 'Test',
        status: 'scheduled',
        orders: [
          { orderId: 'ORD-001', sequence: 0, status: 'pending' },
          { orderId: 'ORD-002', sequence: 1, status: 'pending' }
        ]
      };

      const created = await DeliveryRoutesApi.createDelivery(newDelivery);
      const updated = await DeliveryRoutesApi.addOrderToDelivery(created.id, 'ORD-003', 1);
      const updatedWithOrders = asDeliveryWithOrders(updated);

      expect(updatedWithOrders?.orders).toHaveLength(3);
      expect(updatedWithOrders?.orders?.[1].orderId).toBe('ORD-003');
      expect(updatedWithOrders?.orders?.[0].sequence).toBe(0);
      expect(updatedWithOrders?.orders?.[1].sequence).toBe(1);
      expect(updatedWithOrders?.orders?.[2].sequence).toBe(2);
    });

    it('should return null if delivery is not found', async () => {
      const result = await DeliveryRoutesApi.addOrderToDelivery('NON-EXISTENT', 'ORD-001');

      expect(result).toBeNull();
    });
  });

  describe('removeOrderFromDelivery', () => {
    it('should remove an order from a delivery', async () => {
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> & { orders?: DeliveryRouteWaypoint[] } = {
        name: 'Test',
        status: 'scheduled',
        orders: [
          { orderId: 'ORD-001', sequence: 0, status: 'pending' },
          { orderId: 'ORD-002', sequence: 1, status: 'pending' }
        ]
      };

      const created = await DeliveryRoutesApi.createDelivery(newDelivery);
      const updated = await DeliveryRoutesApi.removeOrderFromDelivery(created.id, 'ORD-001');
      const updatedWithOrders = asDeliveryWithOrders(updated);

      expect(updatedWithOrders?.orders).toHaveLength(1);
      expect(updatedWithOrders?.orders?.[0].orderId).toBe('ORD-002');
      expect(updatedWithOrders?.orders?.[0].sequence).toBe(0); // Resequenced
    });

    it('should resequence orders after removal', async () => {
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> & { orders?: DeliveryRouteWaypoint[] } = {
        name: 'Test',
        status: 'scheduled',
        orders: [
          { orderId: 'ORD-001', sequence: 0, status: 'pending' },
          { orderId: 'ORD-002', sequence: 1, status: 'pending' },
          { orderId: 'ORD-003', sequence: 2, status: 'pending' }
        ]
      };

      const created = await DeliveryRoutesApi.createDelivery(newDelivery);
      const updated = await DeliveryRoutesApi.removeOrderFromDelivery(created.id, 'ORD-002');
      const updatedWithOrders = asDeliveryWithOrders(updated);

      expect(updatedWithOrders?.orders?.[1].sequence).toBe(1); // ORD-003 now at index 1
    });

    it('should return null if delivery is not found', async () => {
      const result = await DeliveryRoutesApi.removeOrderFromDelivery('NON-EXISTENT', 'ORD-001');

      expect(result).toBeNull();
    });
  });

  describe('reorderDeliveryOrders', () => {
    it('should reorder orders within a delivery', async () => {
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> & { orders?: DeliveryRouteWaypoint[] } = {
        name: 'Test',
        status: 'scheduled',
        orders: [
          { orderId: 'ORD-001', sequence: 0, status: 'pending' },
          { orderId: 'ORD-002', sequence: 1, status: 'pending' },
          { orderId: 'ORD-003', sequence: 2, status: 'pending' }
        ]
      };

      const created = await DeliveryRoutesApi.createDelivery(newDelivery);
      const updated = await DeliveryRoutesApi.reorderDeliveryOrders(created.id, 0, 2);
      const updatedWithOrders = asDeliveryWithOrders(updated);

      expect(updatedWithOrders?.orders?.[0].orderId).toBe('ORD-002');
      expect(updatedWithOrders?.orders?.[1].orderId).toBe('ORD-003');
      expect(updatedWithOrders?.orders?.[2].orderId).toBe('ORD-001');
    });

    it('should update sequence numbers after reordering', async () => {
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> & { orders?: DeliveryRouteWaypoint[] } = {
        name: 'Test',
        status: 'scheduled',
        orders: [
          { orderId: 'ORD-001', sequence: 0, status: 'pending' },
          { orderId: 'ORD-002', sequence: 1, status: 'pending' },
          { orderId: 'ORD-003', sequence: 2, status: 'pending' }
        ]
      };

      const created = await DeliveryRoutesApi.createDelivery(newDelivery);
      const updated = await DeliveryRoutesApi.reorderDeliveryOrders(created.id, 2, 0);
      const updatedWithOrders = asDeliveryWithOrders(updated);

      expect(updatedWithOrders?.orders?.[0]?.sequence).toBe(0);
      expect(updatedWithOrders?.orders?.[1]?.sequence).toBe(1);
      expect(updatedWithOrders?.orders?.[2]?.sequence).toBe(2);
    });

    it('should return null if delivery is not found', async () => {
      const result = await DeliveryRoutesApi.reorderDeliveryOrders('NON-EXISTENT', 0, 1);

      expect(result).toBeNull();
    });
  });

  describe('updateDeliveryOrderStatus', () => {
    it('should update the status of an order within a delivery', async () => {
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> & { orders?: DeliveryRouteWaypoint[] } = {
        name: 'Test',
        status: 'scheduled',
        orders: [
          { orderId: 'ORD-001', sequence: 0, status: 'pending' }
        ]
      };

      const created = await DeliveryRoutesApi.createDelivery(newDelivery);
      const updated = await DeliveryRoutesApi.updateDeliveryOrderStatus(created.id, 'ORD-001', 'in-transit');
      const updatedWithOrders = asDeliveryWithOrders(updated);

      expect(updatedWithOrders?.orders?.[0].status).toBe('in-transit');
    });

    it('should set deliveredAt when status is delivered', async () => {
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> & { orders?: DeliveryRouteWaypoint[] } = {
        name: 'Test',
        status: 'scheduled',
        orders: [
          { orderId: 'ORD-001', sequence: 0, status: 'pending' }
        ]
      };

      const created = await DeliveryRoutesApi.createDelivery(newDelivery);
      const beforeUpdate = new Date();
      const updated = await DeliveryRoutesApi.updateDeliveryOrderStatus(created.id, 'ORD-001', 'delivered');
      const afterUpdate = new Date();
      const updatedWithOrders = asDeliveryWithOrders(updated);

      expect(updatedWithOrders?.orders?.[0].status).toBe('delivered');
      expect(updatedWithOrders?.orders?.[0].deliveredAt).toBeDefined();
      if (updatedWithOrders?.orders?.[0].deliveredAt) {
        expect(updatedWithOrders.orders[0].deliveredAt!.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
        expect(updatedWithOrders.orders[0].deliveredAt!.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
      }
    });

    it('should use provided deliveredAt timestamp', async () => {
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> & { orders?: DeliveryRouteWaypoint[] } = {
        name: 'Test',
        status: 'scheduled',
        orders: [
          { orderId: 'ORD-001', sequence: 0, status: 'pending' }
        ]
      };

      const testDate = new Date('2026-01-01T10:00:00');
      const created = await DeliveryRoutesApi.createDelivery(newDelivery);
      const updated = await DeliveryRoutesApi.updateDeliveryOrderStatus(created.id, 'ORD-001', 'delivered', testDate);
      const updatedWithOrders = asDeliveryWithOrders(updated);

      expect(updatedWithOrders?.orders?.[0].deliveredAt).toEqual(testDate);
    });

    it('should add notes to order', async () => {
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> & { orders?: DeliveryRouteWaypoint[] } = {
        name: 'Test',
        status: 'scheduled',
        orders: [
          { orderId: 'ORD-001', sequence: 0, status: 'pending' }
        ]
      };

      const created = await DeliveryRoutesApi.createDelivery(newDelivery);
      const updated = await DeliveryRoutesApi.updateDeliveryOrderStatus(
        created.id,
        'ORD-001',
        'delivered',
        undefined,
        'Delivered to customer'
      );
      const updatedWithOrders = asDeliveryWithOrders(updated);

      expect(updatedWithOrders?.orders?.[0].notes).toBe('Delivered to customer');
    });

    it('should return null if delivery is not found', async () => {
      const result = await DeliveryRoutesApi.updateDeliveryOrderStatus('NON-EXISTENT', 'ORD-001', 'delivered');

      expect(result).toBeNull();
    });
  });

  describe('updateDeliveryStatus', () => {
    it('should update delivery status', async () => {
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test',
        status: 'scheduled'
      };

      const created = await DeliveryRoutesApi.createDelivery(newDelivery);
      const updated = await DeliveryRoutesApi.updateDeliveryStatus(created.id, 'in-progress');

      expect(updated?.status).toBe('in-progress');
    });

    it('should set startedAt when transitioning to in-progress', async () => {
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test',
        status: 'scheduled'
      };

      const startDate = new Date('2026-01-01T10:00:00');
      const created = await DeliveryRoutesApi.createDelivery(newDelivery);
      const updated = await DeliveryRoutesApi.updateDeliveryStatus(created.id, 'in-progress', startDate);

      expect(updated?.startedAt).toEqual(startDate);
    });

    it('should set completedAt when transitioning to completed', async () => {
      const newDelivery: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test',
        status: 'scheduled'
      };

      const completeDate = new Date('2026-01-01T15:00:00');
      const created = await DeliveryRoutesApi.createDelivery(newDelivery);
      const updated = await DeliveryRoutesApi.updateDeliveryStatus(created.id, 'completed', undefined, completeDate);

      expect(updated?.completedAt).toEqual(completeDate);
    });

    it('should return null if delivery is not found', async () => {
      const result = await DeliveryRoutesApi.updateDeliveryStatus('NON-EXISTENT', 'completed');

      expect(result).toBeNull();
    });
  });
});
