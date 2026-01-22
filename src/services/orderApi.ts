import axiosInstance from '../utils/axiosInstance';
import {
  Order,
  OrderResponse,
  OrdersResponse,
  CreateOrderData,
  PaymentData,
} from '../types/Order';

// User functions
export const placeOrder = async (data: CreateOrderData): Promise<OrderResponse> => {
  const response = await axiosInstance.post('/orders', data);
  return response.data;
};

export const getUserOrders = async (): Promise<OrdersResponse> => {
  const response = await axiosInstance.get('/orders/my');
  return response.data;
};

// This function now works for both users and admins
export const getOrderById = async (id: string, isAdmin: boolean = false): Promise<OrderResponse> => {
  const response = await axiosInstance.get(`/orders/${id}`, {
    isAdmin: isAdmin,
  });
  return response.data;
};

export const markAsPaid = async (
  id: string,
  paymentData: PaymentData
): Promise<OrderResponse> => {
  const response = await axiosInstance.put(`/orders/${id}/pay`, paymentData);
  return response.data;
};

// Admin functions - keeping these for backward compatibility
export const adminGetOrderById = async (id: string): Promise<OrderResponse> => {
  return getOrderById(id, true);
};

export const adminGetAllOrders = async (
  page?: number,
  limit?: number,
  days?: string
): Promise<OrdersResponse> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  if (days) params.append('days', days);

  const response = await axiosInstance.get(`/orders?${params.toString()}`, {
    isAdmin: true,
  });

  return response.data;
};

export const adminUpdateOrderStatus = async (
  id: string,
  status: string
): Promise<OrderResponse> => {
  const response = await axiosInstance.put(
    `/orders/${id}/status`,
    { status },
    {
      isAdmin: true,
    }
  );
  return response.data;
};

export const adminMarkAsDelivered = async (id: string): Promise<OrderResponse> => {
  const response = await axiosInstance.put(
    `/orders/${id}/deliver`,
    {},
    {
      isAdmin: true,
    }
  );
  return response.data;
};