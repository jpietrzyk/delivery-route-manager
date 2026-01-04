import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Order } from "@/types/order"
import type { DeliveryRouteWaypoint } from "@/types/delivery-route"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Filter orders to find those that are not assigned to any delivery via waypoints
 * @param orders - All orders to filter
 * @param allWaypoints - All waypoints across all deliveries
 * @returns Orders that don't have any waypoint assigned to them
 */
export function getUnassignedOrders(
  orders: Order[],
  allWaypoints: DeliveryRouteWaypoint[]
): Order[] {
  // Create a set of order IDs that are assigned to any delivery
  const assignedOrderIds = new Set(allWaypoints.map((wp) => wp.orderId))

  // Filter orders to return only those not in any delivery
  return orders.filter((order) => !assignedOrderIds.has(order.id))
}
