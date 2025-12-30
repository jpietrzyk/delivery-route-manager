import type { Order } from '@/types/order';
import { getDistanceKm, getDriveMinutes, getHandlingMinutes } from './delivery-time-utils';

export function calculateTotalEstimatedTime(orders: Order[]): number {
  if (orders.length === 0) {
    return 0;
  }

  let totalTime = 0;

  // Add handling time for the first order (starting point)
  totalTime += getHandlingMinutes(orders[0].product?.complexity ?? 1);

  // Calculate drive and handling times for subsequent orders
  for (let i = 1; i < orders.length; i++) {
    const prevOrder = orders[i - 1];
    const currentOrder = orders[i];

    // Calculate drive time between orders
    const distanceKm = getDistanceKm(prevOrder.location, currentOrder.location);
    const driveMinutes = getDriveMinutes(distanceKm);
    totalTime += driveMinutes;

    // Add handling time for current order
    totalTime += getHandlingMinutes(currentOrder.product?.complexity ?? 1);
  }

  return totalTime;
}

export function calculateTotalDistance(orders: Order[]): number {
  if (orders.length < 2) {
    return 0;
  }

  let totalDistance = 0;

  // Calculate distances between consecutive orders
  for (let i = 1; i < orders.length; i++) {
    const prevOrder = orders[i - 1];
    const currentOrder = orders[i];
    totalDistance += getDistanceKm(prevOrder.location, currentOrder.location);
  }

  return totalDistance;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  } else {
    return `${remainingMinutes}m`;
  }
}

export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}
