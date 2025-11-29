export interface Order {
  id: string;
  name: string;
  comment?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  customer: string;
  totalAmount?: number;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

// Sample orders data
export const sampleOrders: Order[] = [
  {
    id: 'ORD-001',
    name: 'Steel Delivery Order',
    comment: 'Urgent delivery required for construction project',
    status: 'pending',
    priority: 'high',
    createdAt: new Date('2025-11-28T10:30:00Z'),
    updatedAt: new Date('2025-11-29T08:15:00Z'),
    customer: 'BuildCorp Construction',
    totalAmount: 12500.00,
    items: [
      {
        id: 'ITEM-001',
        name: 'Steel Beams - IPE 300',
        quantity: 50,
        price: 150.00
      }
    ]
  },
  {
    id: 'ORD-002',
    name: 'Aluminum Profiles Order',
    comment: 'Window frames for residential building',
    status: 'in-progress',
    priority: 'medium',
    createdAt: new Date('2025-11-27T14:20:00Z'),
    updatedAt: new Date('2025-11-29T09:45:00Z'),
    customer: 'WindowTech Solutions',
    totalAmount: 8750.50,
    items: [
      {
        id: 'ITEM-002',
        name: 'Aluminum Profile 40x40',
        quantity: 200,
        price: 25.50
      },
      {
        id: 'ITEM-003',
        name: 'Corner Brackets',
        quantity: 100,
        price: 12.75
      }
    ]
  },
  {
    id: 'ORD-003',
    name: 'Stainless Steel Components',
    comment: 'Kitchen equipment parts',
    status: 'completed',
    priority: 'low',
    createdAt: new Date('2025-11-25T11:00:00Z'),
    updatedAt: new Date('2025-11-28T16:30:00Z'),
    customer: 'MetalCraft Industries',
    totalAmount: 3200.00,
    items: [
      {
        id: 'ITEM-004',
        name: 'Stainless Steel Sheets 2mm',
        quantity: 20,
        price: 160.00
      }
    ]
  },
  {
    id: 'ORD-004',
    name: 'Structural Steel Order',
    comment: 'Bridge construction materials',
    status: 'pending',
    priority: 'high',
    createdAt: new Date('2025-11-29T07:15:00Z'),
    updatedAt: new Date('2025-11-29T07:15:00Z'),
    customer: 'Infrastructure Plus',
    totalAmount: 45000.00,
    items: [
      {
        id: 'ITEM-005',
        name: 'Steel Plates 20mm',
        quantity: 100,
        price: 200.00
      },
      {
        id: 'ITEM-006',
        name: 'I-Beams HEB 400',
        quantity: 50,
        price: 500.00
      }
    ]
  },
  {
    id: 'ORD-005',
    name: 'Custom Metal Fabrication',
    comment: 'Art installation pieces',
    status: 'cancelled',
    priority: 'low',
    createdAt: new Date('2025-11-26T13:45:00Z'),
    updatedAt: new Date('2025-11-28T10:20:00Z'),
    customer: 'ArtStudio Contemporary',
    totalAmount: 5600.00,
    items: [
      {
        id: 'ITEM-007',
        name: 'Corten Steel Sheets',
        quantity: 15,
        price: 280.00
      },
      {
        id: 'ITEM-008',
        name: 'Custom Cut Pieces',
        quantity: 30,
        price: 80.00
      }
    ]
  }
];
