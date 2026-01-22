export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface Product {
  _id: any;
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  images: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Category {
  parent: any;
  id: string;
  name: string;
  description: string;
  image?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  logo?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface FlashDeal {
  id: string;
  title: string;
  description: string;
  discount: number;
  startDate: string;
  endDate: string;
  products: string[];
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  position: 'hero' | 'sidebar' | 'footer';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyGrowth: number;
}