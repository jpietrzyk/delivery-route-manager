

export interface Order {
  id: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: number; // positive integer or 0
  createdAt?: string; // ISO string, optional
  updatedAt?: string; // ISO string, optional
  customer: {
    name: string;
    info?: string;
  };
  totalAmount: number;
  items?: OrderItem[];
  location: {
    lat: number;
    lng: number;
  };
  complexity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}
