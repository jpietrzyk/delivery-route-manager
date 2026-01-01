/**
 * Tests for DeliveryRouteWaypointsApi service
 */
import { DeliveryRouteWaypointsApi } from '@/services/deliveryRouteWaypointsApi';
import type { DeliveryRouteWaypoint } from '@/types/delivery';

// Mock fetch globally
(globalThis as typeof globalThis).fetch = jest.fn();

describe('DeliveryRouteWaypointsApi', () => {
  const mockWaypointsData: DeliveryRouteWaypoint[] = [
    {
      orderId: 'ORD-001',
      sequence: 1,
      status: 'pending',
      driveTimeEstimate: 10,
      notes: 'First delivery'
    },
    {
      orderId: 'ORD-002',
      sequence: 2,
      status: 'pending',
      driveTimeEstimate: 15,
      notes: 'Second delivery'
    },
    {
      orderId: 'ORD-003',
      sequence: 3,
      status: 'in-transit',
      driveTimeEstimate: 12,
      arrivalTime: new Date('2026-01-01T10:00:00'),
      notes: 'In transit'
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the API cache before each test
    DeliveryRouteWaypointsApi.resetCache();
  });

  describe('getWaypoints', () => {
    it('should fetch and return all waypoints', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaypointsData
      });

      const waypoints = await DeliveryRouteWaypointsApi.getWaypoints();

      expect(waypoints).toHaveLength(3);
      expect(waypoints[0].orderId).toBe('ORD-001');
      expect(waypoints[1].orderId).toBe('ORD-002');
      expect(waypoints[2].orderId).toBe('ORD-003');
    });

    it('should return a copy of waypoints data to prevent external mutations', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaypointsData
      });

      const waypoints1 = await DeliveryRouteWaypointsApi.getWaypoints();
      const waypoints2 = await DeliveryRouteWaypointsApi.getWaypoints();

      // Modify first copy
      waypoints1[0].status = 'delivered';

      // Second copy should not be affected
      expect(waypoints2[0].status).toBe('pending');
    });

    it('should handle fetch errors gracefully', async () => {
      DeliveryRouteWaypointsApi.resetCache();
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(DeliveryRouteWaypointsApi.getWaypoints()).rejects.toThrow(
        'Failed to load waypoints data'
      );
    });
  });

  describe('getWaypointByOrderId', () => {
    it('should return a waypoint by order ID', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaypointsData
      });

      const waypoint = await DeliveryRouteWaypointsApi.getWaypointByOrderId('ORD-002');

      expect(waypoint).toBeDefined();
      expect(waypoint?.orderId).toBe('ORD-002');
      expect(waypoint?.sequence).toBe(2);
      expect(waypoint?.status).toBe('pending');
    });

    it('should return null if waypoint is not found', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaypointsData
      });

      const waypoint = await DeliveryRouteWaypointsApi.getWaypointByOrderId('ORD-999');

      expect(waypoint).toBeNull();
    });

    it('should return a copy of the waypoint', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaypointsData
      });

      const waypoint1 = await DeliveryRouteWaypointsApi.getWaypointByOrderId('ORD-001');
      const waypoint2 = await DeliveryRouteWaypointsApi.getWaypointByOrderId('ORD-001');

      if (waypoint1 && waypoint2) {
        waypoint1.status = 'delivered';
        expect(waypoint2.status).toBe('pending');
      }
    });
  });

  describe('getWaypointsByDeliveryId', () => {
    it('should return waypoints for a delivery', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaypointsData
      });

      const waypoints = await DeliveryRouteWaypointsApi.getWaypointsByDeliveryId('DEL-001');

      expect(waypoints).toHaveLength(3);
      expect(waypoints.every(wp => typeof wp.orderId === 'string')).toBe(true);
    });
  });

  describe('updateWaypointStatus', () => {
    it('should update waypoint status', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaypointsData
      });

      const updatedWaypoint = await DeliveryRouteWaypointsApi.updateWaypointStatus(
        'ORD-001',
        'delivered'
      );

      expect(updatedWaypoint).toBeDefined();
      expect(updatedWaypoint?.status).toBe('delivered');
      expect(updatedWaypoint?.deliveredAt).toBeDefined();
      expect(updatedWaypoint?.deliveredAt instanceof Date).toBe(true);
    });

    it('should set deliveredAt when status is delivered', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaypointsData
      });

      const updatedWaypoint = await DeliveryRouteWaypointsApi.updateWaypointStatus(
        'ORD-002',
        'delivered'
      );

      expect(updatedWaypoint?.deliveredAt).toBeDefined();
    });

    it('should not set deliveredAt for non-delivered statuses', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaypointsData
      });

      const updatedWaypoint = await DeliveryRouteWaypointsApi.updateWaypointStatus(
        'ORD-003',
        'failed'
      );

      expect(updatedWaypoint?.status).toBe('failed');
      expect(updatedWaypoint?.deliveredAt).toBeUndefined();
    });

    it('should return null if waypoint is not found', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaypointsData
      });

      const updatedWaypoint = await DeliveryRouteWaypointsApi.updateWaypointStatus(
        'ORD-999',
        'delivered'
      );

      expect(updatedWaypoint).toBeNull();
    });
  });

  describe('updateWaypointTiming', () => {
    it('should update waypoint timing information', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaypointsData
      });

      const arrivalTime = new Date('2026-01-01T10:15:00');
      const departureTime = new Date('2026-01-01T10:25:00');

      const updatedWaypoint = await DeliveryRouteWaypointsApi.updateWaypointTiming(
        'ORD-001',
        {
          arrivalTime,
          departureTime,
          driveTimeActual: 12
        }
      );

      expect(updatedWaypoint?.arrivalTime).toEqual(arrivalTime);
      expect(updatedWaypoint?.departureTime).toEqual(departureTime);
      expect(updatedWaypoint?.driveTimeActual).toBe(12);
    });

    it('should return null if waypoint is not found', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaypointsData
      });

      const updatedWaypoint = await DeliveryRouteWaypointsApi.updateWaypointTiming(
        'ORD-999',
        { driveTimeActual: 15 }
      );

      expect(updatedWaypoint).toBeNull();
    });
  });

  describe('updateWaypoint', () => {
    it('should update any waypoint fields', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaypointsData
      });

      const updatedWaypoint = await DeliveryRouteWaypointsApi.updateWaypoint(
        'ORD-001',
        {
          status: 'delivered',
          notes: 'Updated notes',
          driveTimeEstimate: 20
        }
      );

      expect(updatedWaypoint?.status).toBe('delivered');
      expect(updatedWaypoint?.notes).toBe('Updated notes');
      expect(updatedWaypoint?.driveTimeEstimate).toBe(20);
      expect(updatedWaypoint?.orderId).toBe('ORD-001'); // orderId should not change
    });

    it('should preserve orderId during update', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaypointsData
      });

      const updatedWaypoint = await DeliveryRouteWaypointsApi.updateWaypoint(
        'ORD-002',
        {
          orderId: 'ORD-999', // Attempt to change orderId
          status: 'delivered'
        }
      );

      expect(updatedWaypoint?.orderId).toBe('ORD-002'); // orderId should remain unchanged
    });

    it('should return null if waypoint is not found', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaypointsData
      });

      const updatedWaypoint = await DeliveryRouteWaypointsApi.updateWaypoint(
        'ORD-999',
        { status: 'delivered' }
      );

      expect(updatedWaypoint).toBeNull();
    });
  });

  describe('Date handling', () => {
    it('should properly convert date strings to Date objects', async () => {
      const dataWithDates = [
        {
          orderId: 'ORD-001',
          sequence: 1,
          status: 'delivered' as const,
          deliveredAt: '2026-01-01T10:30:00',
          arrivalTime: '2026-01-01T10:00:00',
          departureTime: '2026-01-01T10:30:00'
        }
      ];

      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => dataWithDates
      });

      const waypoints = await DeliveryRouteWaypointsApi.getWaypoints();

      expect(waypoints[0].deliveredAt instanceof Date).toBe(true);
      expect(waypoints[0].arrivalTime instanceof Date).toBe(true);
      expect(waypoints[0].departureTime instanceof Date).toBe(true);
    });

    it('should handle missing dates gracefully', async () => {
      DeliveryRouteWaypointsApi.resetCache();
      const dataWithoutDates = [
        {
          orderId: 'ORD-001',
          sequence: 1,
          status: 'pending' as const
        }
      ];

      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => dataWithoutDates
      });

      const waypoints = await DeliveryRouteWaypointsApi.getWaypoints();

      expect(waypoints[0].deliveredAt).toBeUndefined();
      expect(waypoints[0].arrivalTime).toBeUndefined();
      expect(waypoints[0].departureTime).toBeUndefined();
    });
  });
});
