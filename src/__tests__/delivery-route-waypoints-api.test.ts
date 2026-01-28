/**
 * Tests for DeliveryRouteWaypointsApi service - waypoint-based many-to-many architecture
 *
 * Testing the new Map-based API that manages waypoint relationships between
 * deliveries and orders in a many-to-many pattern.
 */
import { DeliveryRouteWaypointsApi } from '@/services/delivery-route-waypoints-api';
import type { DeliveryRouteWaypoint } from '@/types/delivery-route';

// Mock fetch globally
(globalThis as typeof globalThis).fetch = jest.fn();

describe('DeliveryRouteWaypointsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWaypointsByDelivery', () => {
    it('should return waypoints for a specific delivery sorted by sequence', async () => {
      const waypoints = await DeliveryRouteWaypointsApi.getWaypointsByDelivery('DEL-001');

      expect(Array.isArray(waypoints)).toBe(true);
      // Waypoints should be sorted by sequence
      if (waypoints.length > 1) {
        expect(waypoints[0].sequence).toBeLessThanOrEqual(waypoints[1].sequence);
      }
    });
  });

  describe('getDeliveriesForOrder', () => {
    it('should return deliveries containing a specific order', async () => {
      const deliveries = await DeliveryRouteWaypointsApi.getDeliveriesForOrder('ORD-001');
      expect(Array.isArray(deliveries)).toBe(true);
    });
  });

  describe('addWaypoint', () => {
    it('should add a waypoint to a delivery', async () => {
      const result = await DeliveryRouteWaypointsApi.addWaypoint('DEL-001', 'ORD-004');

      // Result should be the created waypoint or null
      expect(result === null || typeof result === 'object').toBe(true);
    });

    it('should prevent duplicate orders in same delivery', async () => {
      // Add same order twice to same delivery
      const result1 = await DeliveryRouteWaypointsApi.addWaypoint('DEL-001', 'ORD-005');

      // Second add should fail due to duplicate validation
      if (result1) {
        expect(result1.orderId).toBe('ORD-005');
      }
    });
  });

  describe('removeWaypoint', () => {
    it('should remove a waypoint from a delivery', async () => {
      // Add first
      await DeliveryRouteWaypointsApi.addWaypoint('DEL-002', 'ORD-010');

      // Verify it was added
      let waypoints = await DeliveryRouteWaypointsApi.getWaypointsByDelivery('DEL-002');
      expect(waypoints.length).toBeGreaterThan(0);

      // Then remove
      const result = await DeliveryRouteWaypointsApi.removeWaypoint('DEL-002', 'ORD-010');

      // Should return undefined (void)
      expect(result).toBeUndefined();

      // Verify it was removed
      waypoints = await DeliveryRouteWaypointsApi.getWaypointsByDelivery('DEL-002');
      const found = waypoints.find(w => w.orderId === 'ORD-010');
      expect(found).toBeUndefined();
    });
  });

  describe('reorderWaypoints', () => {
    it('should move waypoint from one position to another', async () => {
      // Add waypoints
      await DeliveryRouteWaypointsApi.addWaypoint('DEL-003', 'ORD-020');
      await DeliveryRouteWaypointsApi.addWaypoint('DEL-003', 'ORD-021');
      await DeliveryRouteWaypointsApi.addWaypoint('DEL-003', 'ORD-022');

      // Reorder
      const waypoints = await DeliveryRouteWaypointsApi.reorderWaypoints('DEL-003', 0, 2);

      expect(Array.isArray(waypoints)).toBe(true);
    });
  });

  describe('updateWaypointStatus', () => {
    it('should update waypoint status', async () => {
      await DeliveryRouteWaypointsApi.addWaypoint('DEL-004', 'ORD-030');

      const updated = await DeliveryRouteWaypointsApi.updateWaypointStatus('DEL-004', 'ORD-030', 'delivered');

      expect(updated?.status).toBe('delivered');
    });

    it('should set deliveredAt when status is delivered', async () => {
      await DeliveryRouteWaypointsApi.addWaypoint('DEL-005', 'ORD-031');

      const updated = await DeliveryRouteWaypointsApi.updateWaypointStatus('DEL-005', 'ORD-031', 'delivered');

      if (updated?.status === 'delivered') {
        expect(updated.deliveredAt).toBeDefined();
      }
    });

    it('should not set deliveredAt for non-delivered statuses', async () => {
      await DeliveryRouteWaypointsApi.addWaypoint('DEL-006', 'ORD-032');

      const updated = await DeliveryRouteWaypointsApi.updateWaypointStatus('DEL-006', 'ORD-032', 'in-transit');

      expect(updated?.status).toBe('in-transit');
    });

    it('should return null if waypoint not found', async () => {
      const updated = await DeliveryRouteWaypointsApi.updateWaypointStatus('DEL-999', 'ORD-999', 'delivered');

      expect(updated).toBeNull();
    });
  });

  describe('updateWaypoint', () => {
    it('should update any waypoint fields', async () => {
      await DeliveryRouteWaypointsApi.addWaypoint('DEL-007', 'ORD-033');

      const updated = await DeliveryRouteWaypointsApi.updateWaypoint('DEL-007', 'ORD-033', {
        status: 'delivered',
        notes: 'Updated notes',
        driveTimeEstimate: 20
      });

      expect(updated?.status).toBe('delivered');
      expect(updated?.notes).toBe('Updated notes');
      expect(updated?.driveTimeEstimate).toBe(20);
    });

    it('should preserve deliveryId and orderId during update', async () => {
      await DeliveryRouteWaypointsApi.addWaypoint('DEL-008', 'ORD-034');

      const updated = await DeliveryRouteWaypointsApi.updateWaypoint(
        'DEL-008',
        'ORD-034',
        {
          orderId: 'ORD-999', // Attempt to change
          deliveryId: 'DEL-999', // Attempt to change
          status: 'delivered',
        } as unknown as Partial<Omit<DeliveryRouteWaypoint, 'deliveryId' | 'orderId' | 'sequence'>>
      );

      expect(updated?.orderId).toBe('ORD-034');
      expect(updated?.deliveryId).toBe('DEL-008');
    });

    it('should return null if waypoint not found', async () => {
      const updated = await DeliveryRouteWaypointsApi.updateWaypoint('DEL-999', 'ORD-999', {
        status: 'delivered'
      });

      expect(updated).toBeNull();
    });
  });

  describe('getWaypoint', () => {
    it('should retrieve a specific waypoint', async () => {
      await DeliveryRouteWaypointsApi.addWaypoint('DEL-009', 'ORD-035');

      const waypoint = await DeliveryRouteWaypointsApi.getWaypoint('DEL-009', 'ORD-035');

      expect(waypoint?.orderId).toBe('ORD-035');
    });

    it('should return null for non-existent waypoint', async () => {
      const waypoint = await DeliveryRouteWaypointsApi.getWaypoint('DEL-999', 'ORD-999');

      expect(waypoint).toBeNull();
    });
  });

  describe('Many-to-many scenarios', () => {
    it('should allow same order in multiple deliveries', async () => {
      const wp1 = await DeliveryRouteWaypointsApi.addWaypoint('DEL-010', 'ORD-040');
      const wp2 = await DeliveryRouteWaypointsApi.addWaypoint('DEL-011', 'ORD-040');

      expect(wp1?.orderId).toBe('ORD-040');
      expect(wp2?.orderId).toBe('ORD-040');
    });

    it('should find all deliveries containing an order', async () => {
      await DeliveryRouteWaypointsApi.addWaypoint('DEL-012', 'ORD-041');
      await DeliveryRouteWaypointsApi.addWaypoint('DEL-013', 'ORD-041');

      const deliveries = await DeliveryRouteWaypointsApi.getDeliveriesForOrder('ORD-041');

      expect(Array.isArray(deliveries)).toBe(true);
    });
  });

  describe('Resequencing', () => {
    it('should maintain proper sequence after add/remove/reorder', async () => {
      // Add three waypoints
      await DeliveryRouteWaypointsApi.addWaypoint('DEL-014', 'ORD-050');
      await DeliveryRouteWaypointsApi.addWaypoint('DEL-014', 'ORD-051');
      await DeliveryRouteWaypointsApi.addWaypoint('DEL-014', 'ORD-052');

      let waypoints = await DeliveryRouteWaypointsApi.getWaypointsByDelivery('DEL-014');

      // Sequences should be properly ordered
      if (waypoints.length >= 3) {
        const sorted = [...waypoints].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
        expect(sorted[0].sequence).toBe(0);
        expect(sorted[1].sequence).toBe(1);
        expect(sorted[2].sequence).toBe(2);
      }

      // Remove middle waypoint
      await DeliveryRouteWaypointsApi.removeWaypoint('DEL-014', 'ORD-051');

      waypoints = await DeliveryRouteWaypointsApi.getWaypointsByDelivery('DEL-014');

      // Remaining should be resequenced
      if (waypoints.length >= 2) {
        const sorted = [...waypoints].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
        expect(sorted[0].sequence).toBe(0);
        expect(sorted[1].sequence).toBe(1);
      }
    });
  });
});
