// types/AgentStats.ts
export interface AgentStats {
  totalOrders: number;
  pendingOrders: number;
  pendingCommissions: number; // Available for payout
  totalEarnings: number; // All time paid
  currentBalance: number; // Same as pendingCommissions
}

export interface AgentStatsResponse {
  success: boolean;
  data: {
    agent: {
      _id: string;
      name: string;
      email: string;
      phone: string;
      pickupStation?: {
        _id: string;
        name: string;
        address: string;
        city: string;
        state?: string;
      };
    };
    stats: AgentStats;
  };
}

export interface AgentOrder {
  _id: string;
  orderNumber: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'arrived_at_station' | 'delivered' | 'cancelled';
  createdAt: string;
  totalPrice: number;
  deliveryMethod: 'home_delivery' | 'pickup_station';
  createdBy: 'customer' | 'agent';
}

export interface AgentOrdersResponse {
  success: boolean;
  data: {
    orders: AgentOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface CommissionAnalytic {
  _id: {
    year: number;
    month: number;
  };
  totalAmount: number;
  count: number;
  deliveryCommissions: number;
  agentOrderCommissions: number;
}

export interface OrderAnalytic {
  _id: {
    year: number;
    month: number;
  };
  totalOrders: number;
  totalValue: number;
  deliveredOrders: number;
}

export interface AgentAnalyticsResponse {
  success: boolean;
  data: {
    commissionAnalytics: CommissionAnalytic[];
    orderAnalytics: OrderAnalytic[];
    period: {
      startDate: string;
      endDate: string;
    };
  };
}

export interface AgentOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface AgentAnalyticsParams {
  startDate?: string;
  endDate?: string;
}