import type { Order } from './order';

/**
 * DeliveryRoute represents a delivery plan with metadata and its waypoint list.
 * Orders are linked via DeliveryRouteWaypoint junction table (many-to-many relationship).
 * The `orders` array is kept on the route instance for convenience in the UI layer.
 */
export interface DeliveryRoute {
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
  notes?: string;
  estimatedDistance?: number; // in kilometers
  estimatedDuration?: number; // in minutes
  // Time tracking fields
  totalDeliveryTime?: number; // Total time spent delivering all orders (minutes)
  totalDriveTime?: number; // Total time spent driving between locations (minutes)
  totalBuildTime?: number; // Total time spent building garages (minutes)
  totalTime?: number; // Total delivery time including all activities (minutes)
  orders: DeliveryRouteWaypoint[]; // Waypoints in order for this route
}

/**
 * DeliveryRouteWaypoint is a junction table establishing many-to-many relationship
 * between DeliveryRoute and Order.
 *
 * Each waypoint represents an order's position in a delivery route with its status
 * and time tracking information.
 *
 * Multiple deliveries can reference the same order (in different draft states).
 * An order can be removed from one delivery without affecting others.
 */
export interface DeliveryRouteWaypoint {
  deliveryId?: string;  // Foreign key to DeliveryRoute
  orderId: string;     // Foreign key to Order
  sequence: number;    // Position in the delivery route (0-based)
  status: 'pending' | 'in-transit' | 'delivered' | 'failed';
  deliveredAt?: Date;
  notes?: string;
  order?: Order;       // Populated order data (for display, populated on demand)
  // Time tracking fields
  driveTimeEstimate?: number; // Estimated drive time from previous location (minutes)
  driveTimeActual?: number;   // Actual drive time from previous location (minutes)
  arrivalTime?: Date;         // When arrived at this order location
  departureTime?: Date;       // When departed from this order location
}

// Sample deliveries data (metadata only - no embedded orders)
export const sampleDeliveries: DeliveryRoute[] = [
  {
    id: 'DEL-001',
    name: 'Morning Delivery Route - Budapest',
    status: 'scheduled',
    driver: 'John Kowalski',
    vehicle: 'Truck-01 (VAN-1234)',
    scheduledDate: new Date('2025-12-06T08:00:00Z'),
    createdAt: new Date('2025-12-05T14:00:00Z'),
    updatedAt: new Date('2025-12-05T15:30:00Z'),
    notes: 'First delivery of the day. Start at warehouse.',
    estimatedDistance: 45.5,
    estimatedDuration: 120,
    orders: [],
  },
];

/**
 * Sample delivery route waypoints (junction table data)
 * These connect orders to deliveries in a many-to-many relationship
 */
export const sampleDeliveryWaypoints: DeliveryRouteWaypoint[] = [
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-001',
    sequence: 0,
    status: 'pending',
    driveTimeEstimate: 0, // Starting point, no drive time
    driveTimeActual: 0,
  },
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-002',
    sequence: 1,
    status: 'pending',
    driveTimeEstimate: 45, // 45 minutes drive from previous location
    driveTimeActual: 0,
  },
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-003',
    sequence: 2,
    status: 'pending',
    driveTimeEstimate: 30, // 30 minutes drive from previous location
    driveTimeActual: 0,
  },
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-013',
    sequence: 3,
    status: 'pending',
    driveTimeEstimate: 25, // 25 minutes drive from previous location
    driveTimeActual: 0,
  },
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-014',
    sequence: 4,
    status: 'pending',
    driveTimeEstimate: 20, // 20 minutes drive from previous location
    driveTimeActual: 0,
  },
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-015',
    sequence: 5,
    status: 'pending',
    driveTimeEstimate: 15, // 15 minutes drive from previous location
    driveTimeActual: 0,
  },
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-016',
    sequence: 6,
    status: 'pending',
    driveTimeEstimate: 18, // 18 minutes drive from previous location
    driveTimeActual: 0,
  },
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-017',
    sequence: 7,
    status: 'pending',
    driveTimeEstimate: 22, // 22 minutes drive from previous location
    driveTimeActual: 0,
  },
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-018',
    sequence: 8,
    status: 'pending',
    driveTimeEstimate: 12, // 12 minutes drive from previous location
    driveTimeActual: 0,
  },
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-019',
    sequence: 9,
    status: 'pending',
    driveTimeEstimate: 10, // 10 minutes drive from previous location
    driveTimeActual: 0,
  },
];
