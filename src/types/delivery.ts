import type { Order } from './order';

/**
 * Delivery represents a planned delivery route.
 * Orders are "pulled" from the pool and assigned to a delivery.
 * Once assigned, orders are removed from the pool (order.deliveryId is set).
 */
export interface Delivery {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  driver?: string;
  vehicle?: string;
  scheduledDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  orders: DeliveryRouteItem[]; // Orders in this delivery with their sequence
  notes?: string;
  estimatedDistance?: number; // in kilometers
  estimatedDuration?: number; // in minutes
  // Time tracking fields
  totalDeliveryTime?: number; // Total time spent delivering all orders (minutes)
  totalDriveTime?: number; // Total time spent driving between locations (minutes)
  totalBuildTime?: number; // Total time spent building garages (minutes)
  totalTime?: number; // Total delivery time including all activities (minutes)
}

/**
 * DeliveryRouteItem represents an order within a delivery with its position and status.
 */
export interface DeliveryRouteItem {
  orderId: string;
  sequence: number; // Position in the delivery route (0-based)
  status: 'pending' | 'in-transit' | 'delivered' | 'failed';
  deliveredAt?: Date;
  notes?: string;
  order?: Order; // Populated order data (for display)
  // Time tracking fields
  driveTimeEstimate?: number; // Estimated drive time from previous location (minutes)
  driveTimeActual?: number; // Actual drive time from previous location (minutes)
  arrivalTime?: Date; // When arrived at this order location
  departureTime?: Date; // When departed from this order location
}

// Helper function to create a new delivery
export function createDelivery(params: {
  name: string;
  orders: string[]; // Array of order IDs
  driver?: string;
  vehicle?: string;
  scheduledDate?: Date;
  notes?: string;
}): Delivery {
  const now = new Date();

  return {
    id: `DEL-${Date.now()}`,
    name: params.name,
    status: 'draft',
    driver: params.driver,
    vehicle: params.vehicle,
    scheduledDate: params.scheduledDate,
    createdAt: now,
    updatedAt: now,
    orders: params.orders.map((orderId, index) => ({
      orderId,
      sequence: index,
      status: 'pending',
    })),
    notes: params.notes,
  };
}

// Helper function to add an order to a delivery
export function addOrderToDelivery(
  delivery: Delivery,
  orderId: string,
  atIndex?: number
): Delivery {
  const newDeliveryRouteItem: DeliveryRouteItem = {
    orderId,
    sequence: atIndex ?? delivery.orders.length,
    status: 'pending',
  };

  const updatedOrders = [...delivery.orders];

  if (atIndex !== undefined && atIndex >= 0 && atIndex <= delivery.orders.length) {
    updatedOrders.splice(atIndex, 0, newDeliveryRouteItem);
    // Resequence all orders
    updatedOrders.forEach((order, index) => {
      order.sequence = index;
    });
  } else {
    updatedOrders.push(newDeliveryRouteItem);
  }

  return {
    ...delivery,
    orders: updatedOrders,
    updatedAt: new Date(),
  };
}

// Helper function to remove an order from a delivery
export function removeOrderFromDelivery(
  delivery: Delivery,
  orderId: string
): Delivery {
  const updatedOrders = delivery.orders
    .filter((order) => order.orderId !== orderId)
    .map((order, index) => ({
      ...order,
      sequence: index,
    }));

  return {
    ...delivery,
    orders: updatedOrders,
    updatedAt: new Date(),
  };
}

// Helper function to reorder orders in a delivery
export function reorderDeliveryOrders(
  delivery: Delivery,
  fromIndex: number,
  toIndex: number
): Delivery {
  const updatedOrders = [...delivery.orders];
  const [removed] = updatedOrders.splice(fromIndex, 1);
  updatedOrders.splice(toIndex, 0, removed);

  // Resequence all orders
  updatedOrders.forEach((order, index) => {
    order.sequence = index;
  });

  return {
    ...delivery,
    orders: updatedOrders,
    updatedAt: new Date(),
  };
}

// Helper function to update delivery order status
export function updateDeliveryOrderStatus(
  delivery: Delivery,
  orderId: string,
  status: DeliveryRouteItem['status'],
  deliveredAt?: Date,
  notes?: string
): Delivery {
  const updatedOrders = delivery.orders.map((order) =>
    order.orderId === orderId
      ? {
          ...order,
          status,
          deliveredAt: status === 'delivered' ? deliveredAt ?? new Date() : order.deliveredAt,
          notes: notes ?? order.notes,
        }
      : order
  );

  return {
    ...delivery,
    orders: updatedOrders,
    updatedAt: new Date(),
  };
}

// Sample deliveries data
export const sampleDeliveries: Delivery[] = [
  {
    id: 'DEL-001',
    name: 'Morning Delivery Route - Budapest',
    status: 'scheduled',
    driver: 'John Kowalski',
    vehicle: 'Truck-01 (VAN-1234)',
    scheduledDate: new Date('2025-12-06T08:00:00Z'),
    createdAt: new Date('2025-12-05T14:00:00Z'),
    updatedAt: new Date('2025-12-05T15:30:00Z'),
    orders: [
      {
        orderId: 'ORD-001',
        sequence: 0,
        status: 'pending',
        driveTimeEstimate: 0, // Starting point, no drive time
        driveTimeActual: 0,
      },
      {
        orderId: 'ORD-002',
        sequence: 1,
        status: 'pending',
        driveTimeEstimate: 45, // 45 minutes drive from previous location
        driveTimeActual: 0,
      },
      {
        orderId: 'ORD-003',
        sequence: 2,
        status: 'pending',
        driveTimeEstimate: 30, // 30 minutes drive from previous location
        driveTimeActual: 0,
      },
      {
        orderId: 'ORD-013',
        sequence: 3,
        status: 'pending',
        driveTimeEstimate: 25, // 25 minutes drive from previous location
        driveTimeActual: 0,
      },
      {
        orderId: 'ORD-014',
        sequence: 4,
        status: 'pending',
        driveTimeEstimate: 20, // 20 minutes drive from previous location
        driveTimeActual: 0,
      },
      {
        orderId: 'ORD-015',
        sequence: 5,
        status: 'pending',
        driveTimeEstimate: 15, // 15 minutes drive from previous location
        driveTimeActual: 0,
      },
      {
        orderId: 'ORD-016',
        sequence: 6,
        status: 'pending',
        driveTimeEstimate: 18, // 18 minutes drive from previous location
        driveTimeActual: 0,
      },
      {
        orderId: 'ORD-017',
        sequence: 7,
        status: 'pending',
        driveTimeEstimate: 22, // 22 minutes drive from previous location
        driveTimeActual: 0,
      },
      {
        orderId: 'ORD-018',
        sequence: 8,
        status: 'pending',
        driveTimeEstimate: 12, // 12 minutes drive from previous location
        driveTimeActual: 0,
      },
      {
        orderId: 'ORD-019',
        sequence: 9,
        status: 'pending',
        driveTimeEstimate: 10, // 10 minutes drive from previous location
        driveTimeActual: 0,
      },
    ],
    notes: 'First delivery of the day. Start at warehouse.',
    estimatedDistance: 45.5,
    estimatedDuration: 120,
  },
];
