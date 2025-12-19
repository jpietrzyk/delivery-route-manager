/**
 * Basic tests for RouteManager service
 */
import { RouteManager } from '@/services/RouteManager';
import type { MapProvider } from '@/types/map-provider';

describe('RouteManager', () => {
  let routeManager: RouteManager;
  let mockMapProvider: jest.Mocked<MapProvider>;

  beforeEach(() => {
    // Create a mock map provider
    mockMapProvider = {
      createMarker: jest.fn(),
      updateMarker: jest.fn(),
      removeMarker: jest.fn(),
      createRouteSegment: jest.fn(),
      drawRouteSegment: jest.fn(),
      updateRouteSegment: jest.fn(),
      removeRouteSegment: jest.fn(),
      fitBounds: jest.fn(),
      setView: jest.fn(),
      onMarkerHover: jest.fn()
    } as unknown as jest.Mocked<MapProvider>;

    routeManager = new RouteManager(mockMapProvider);
  });

  it('should be created with empty segments', () => {
    expect(routeManager).toBeDefined();
    expect(routeManager.getAllSegments()).toHaveLength(0);
  });

  const createMockOrder = (id: string, lat: number, lng: number) => ({
    id,
    product: { name: 'Test Product', price: 100, complexity: 1 } as const,
    status: 'pending' as const,
    priority: 'medium' as const,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: 'Test Customer',
    totalAmount: 100,
    location: { lat, lng },
  });

  it('should create a segment when upsertSegment is called', () => {
    const mockOrder1 = createMockOrder('order-1', 51.505, -0.09);
    const mockOrder2 = createMockOrder('order-2', 51.51, -0.1);

    const segment = routeManager.upsertSegment(mockOrder1, mockOrder2);

    expect(segment).toBeDefined();
    expect(segment.id).toBe('order-1-order-2');
    expect(segment.fromOrder).toBe(mockOrder1);
    expect(segment.toOrder).toBe(mockOrder2);
    expect(routeManager.getAllSegments()).toHaveLength(1);
  });

  it('should return the same segment when upsertSegment is called with same orders', () => {
    const mockOrder1 = createMockOrder('order-1', 51.505, -0.09);
    const mockOrder2 = createMockOrder('order-2', 51.51, -0.1);

    const segment1 = routeManager.upsertSegment(mockOrder1, mockOrder2);
    const segment2 = routeManager.upsertSegment(mockOrder1, mockOrder2);

    expect(segment1.id).toBe(segment2.id);
    expect(routeManager.getAllSegments()).toHaveLength(1);
  });

  it('should remove a segment when removeSegment is called', () => {
    const mockOrder1 = createMockOrder('order-1', 51.505, -0.09);
    const mockOrder2 = createMockOrder('order-2', 51.51, -0.1);

    routeManager.upsertSegment(mockOrder1, mockOrder2);
    expect(routeManager.getAllSegments()).toHaveLength(1);

    routeManager.removeSegment('order-1-order-2');
    expect(routeManager.getAllSegments()).toHaveLength(0);
  });

  it('should clear all segments when clear is called', () => {
    const mockOrder1 = createMockOrder('order-1', 51.505, -0.09);
    const mockOrder2 = createMockOrder('order-2', 51.51, -0.1);
    const mockOrder3 = createMockOrder('order-3', 51.515, -0.11);

    routeManager.upsertSegment(mockOrder1, mockOrder2);
    routeManager.upsertSegment(mockOrder2, mockOrder3);
    expect(routeManager.getAllSegments()).toHaveLength(2);

    routeManager.clear();
    expect(routeManager.getAllSegments()).toHaveLength(0);
  });
});
