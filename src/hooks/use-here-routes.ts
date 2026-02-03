/**
 * Hook to calculate HERE Maps routes based on delivery orders
 */
import { useEffect, useState } from 'react';
import type { Order } from '@/types/order';
import { HereRoutingApi, type RouteSegment } from '@/services/here-routing-api';

interface UseHereRoutesOptions {
  orders: Order[];
  apiKey?: string;
  enabled?: boolean;
}

export const useHereRoutes = ({ orders, apiKey, enabled = true }: UseHereRoutesOptions) => {
  const [routes, setRoutes] = useState<RouteSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !apiKey || orders.length < 2) {
      console.log('useHereRoutes: skipping', { enabled, hasApiKey: !!apiKey, ordersCount: orders.length });
      setRoutes([]);
      return;
    }

    console.log('useHereRoutes: calculating routes for', orders.length, 'orders');

    const calculateRoutes = async () => {
      try {
        setLoading(true);
        setError(null);

        const waypoints = orders.map((order) => ({
          lat: order.location.lat,
          lng: order.location.lng,
        }));

        console.log('useHereRoutes: fetching routes from HERE API...');
        const segments = await HereRoutingApi.calculateRouteSegments(
          waypoints,
          apiKey,
          {
            routeType: 'fastest',
            vehicle: 'car',
          }
        );

        console.log('useHereRoutes: received', segments.length, 'route segments');
        setRoutes(segments);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Failed to calculate HERE routes:', error);
        // Set empty routes on error (will fallback to straight lines in renderer)
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    };

    calculateRoutes();
  }, [orders, apiKey, enabled]);

  return { routes, loading, error };
};
