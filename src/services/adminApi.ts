import axiosInstance from '../utils/axiosInstance';
import { LoginCredentials, AuthResponse } from '../types/User';
import {
  DashboardResponse,
  AdminUsersResponse,
  AdminUserResponse,
  UserFilters,
  UpdateUserData,
  AdminProductsResponse,
  AdminProductFilters,
  UpdateOrderStatusData,
  AdminBannersResponse,
  BannerFilters,
  CreateBannerData,
  BannerResponse,
  AdminResponse
} from '../types/Admin';
import { OrderResponse, OrdersResponse } from '../types/Order';
import { ProductResponse, CreateProductData } from '../types/Product';
import { 
  CreateCategoryData, 
  UpdateCategoryData, 
  CategoryResponse, 
  CategoriesResponse, 
  CategoryFilters,
  ParentCategoriesResponse
} from '../types/Category';
import { CreateBrandData } from '../types/Brand';
import { 
  CreateAgentData, 
  UpdateAgentData,
  AgentResponse, 
  AgentsResponse, 
  AgentFilters,
  CreateAgentWithStationData
} from '../types/Agent';

// Create admin axios instance with different token key
const adminAxiosInstance = axiosInstance;

// Override the request interceptor for admin routes
adminAxiosInstance.interceptors.request.use(
  (config) => {
    // Check if it's an admin route
    if (config.url?.includes('/admin/')) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      // Use regular token for non-admin routes
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Admin Authentication
export const adminLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await adminAxiosInstance.post('/auth/login', credentials);
  return response.data;
};

export const getAdminProfile = async (): Promise<AuthResponse> => {
  const response = await adminAxiosInstance.get('/auth/profile');
  return response.data;
};

// Dashboard
export const getDashboardStats = async (): Promise<DashboardResponse> => {
  const response = await adminAxiosInstance.get('/admin/stats', { isAdmin: true });
  return response.data;
};

export const getProductSalesStats = async (params?: {
  limit?: number;
  months?: number;
}): Promise<{
  success: boolean;
  data: {
    products: Array<{
      _id: string;
      name: string;
      totalSold: number;
      totalRevenue: number;
      stock: number;
      images?: string[];
    }>;
  };
}> => {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.months) queryParams.append('months', params.months.toString());

  const response = await axiosInstance.get(
    `/orders/products/sales?${queryParams.toString()}`,
    { isAdmin: true }
  );
  return response.data;
};

// User Management
export const getAllUsers = async (filters?: UserFilters): Promise<AdminUsersResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await adminAxiosInstance.get(`/admin/users?${params.toString()}`);
  return response.data;
};

export const getUserById = async (id: string): Promise<AdminUserResponse> => {
  const response = await adminAxiosInstance.get(`/admin/users/${id}`);
  return response.data;
};

export const updateUser = async (id: string, data: UpdateUserData): Promise<{ success: boolean; message: string; data: { user: any } }> => {
  const response = await adminAxiosInstance.put(`/admin/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string): Promise<AdminResponse> => {
  const response = await adminAxiosInstance.delete(`/admin/users/${id}`);
  return response.data;
};

// Agent Management
export const getAllAgents = async (filters?: AgentFilters): Promise<AgentsResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await adminAxiosInstance.get(`/admin/agents?${params.toString()}`, { isAdmin: true });
  return response.data;
};

export const getAgentById = async (id: string): Promise<AgentResponse> => {
  const response = await adminAxiosInstance.get(`/admin/agents/${id}`, { isAdmin: true });
  return response.data;
};

export const createAgent = async (data: CreateAgentData): Promise<AgentResponse> => {
  const response = await adminAxiosInstance.post('/admin/agents', data, { isAdmin: true });
  return response.data;
};

export const createAgentWithStation = async (data: CreateAgentWithStationData): Promise<AgentResponse> => {
  const response = await adminAxiosInstance.post('/admin/agents/with-station', data, { isAdmin: true });
  return response.data;
};

export const updateAgent = async (id: string, data: UpdateAgentData): Promise<AgentResponse> => {
  const response = await adminAxiosInstance.put(`/admin/agents/${id}`, data, { isAdmin: true });
  return response.data;
};

export const deleteAgent = async (id: string): Promise<AdminResponse> => {
  const response = await adminAxiosInstance.delete(`/admin/agents/${id}`, { isAdmin: true });
  return response.data;
};

export const getPickupStations = async (): Promise<{
  success: boolean;
  data: {
    stations: Array<{
      _id: string;
      name: string;
      address: string;
      city: string;
    }>;
  };
}> => {
  const response = await adminAxiosInstance.get('/pickup-stations', { isAdmin: true });
  return response.data;
};

// Product Management (Admin)
export const getAllProductsAdmin = async (filters?: AdminProductFilters): Promise<AdminProductsResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await adminAxiosInstance.get(`/admin/products?${params.toString()}`);
  return response.data;
};

export const createProduct = async (data: CreateProductData): Promise<ProductResponse> => {
  const response = await adminAxiosInstance.post('/products', data);
  return response.data;
};

export const updateProduct = async (id: string, data: Partial<CreateProductData>): Promise<ProductResponse> => {
  const response = await adminAxiosInstance.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<AdminResponse> => {
  const response = await adminAxiosInstance.delete(`/products/${id}`);
  return response.data;
};

// Order Management (Admin)
export const getAllOrders = async (page?: number, limit?: number, timeFilter?: string): Promise<OrdersResponse> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  
  const response = await adminAxiosInstance.get(`/orders?${params.toString()}`, { isAdmin: true });
  return response.data;
};

export const getOrderDetails = async (id: string): Promise<OrderResponse> => {
  const response = await adminAxiosInstance.get(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id: string, data: UpdateOrderStatusData): Promise<OrderResponse> => {
  const response = await adminAxiosInstance.put(`/admin/orders/${id}/status`, data);
  return response.data;
};

export const markOrderDelivered = async (id: string): Promise<OrderResponse> => {
  const response = await adminAxiosInstance.put(`/orders/${id}/deliver`);
  return response.data;
};

// Category Management (Admin)
export const getAllCategories = async (): Promise<CategoriesResponse> => {
  const response = await adminAxiosInstance.get('/categories', { isAdmin: true });
  return response.data;
};

export const getAllCategoriesAdmin = async (filters?: CategoryFilters): Promise<CategoriesResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await adminAxiosInstance.get(`/categories/admin/all?${params.toString()}`, { isAdmin: true });
  return response.data;
};

export const getCategoryById = async (id: string): Promise<CategoryResponse> => {
  const response = await adminAxiosInstance.get(`/categories/${id}`, { isAdmin: true });
  return response.data;
};

export const getParentCategories = async (): Promise<ParentCategoriesResponse> => {
  const response = await adminAxiosInstance.get('/categories/parents', { isAdmin: true });
  return response.data;
};

export const createCategory = async (data: CreateCategoryData): Promise<CategoryResponse> => {
  const requestData = {
    name: data.name,
    slug: data.slug,
    parentCategory: data.parentCategory || null,
    description: data.description || '',
    image: data.image || '',
    status: data.status || 'active',
    customFields: data.customFields || []
  };
  
  const response = await adminAxiosInstance.post('/categories', requestData, { isAdmin: true });
  return response.data;
};

export const updateCategory = async (id: string, data: UpdateCategoryData): Promise<CategoryResponse> => {
  const requestData: any = {};
  
  if (data.name !== undefined) requestData.name = data.name;
  if (data.slug !== undefined) requestData.slug = data.slug;
  if (data.parentCategory !== undefined) requestData.parentCategory = data.parentCategory;
  if (data.description !== undefined) requestData.description = data.description;
  if (data.image !== undefined) requestData.image = data.image;
  if (data.status !== undefined) requestData.status = data.status;
  if (data.customFields !== undefined) requestData.customFields = data.customFields;
  
  const response = await adminAxiosInstance.put(`/categories/${id}`, requestData, { isAdmin: true });
  return response.data;
};

export const deleteCategory = async (id: string): Promise<AdminResponse> => {
  const response = await adminAxiosInstance.delete(`/categories/${id}`, { isAdmin: true });
  return response.data;
};

export const reorderCategories = async (categories: { id: string; order: number }[]): Promise<AdminResponse> => {
  const response = await adminAxiosInstance.put('/categories/reorder', { categories }, { isAdmin: true });
  return response.data;
};

// Brand Management (Admin)
export const createBrand = async (data: CreateBrandData): Promise<{ success: boolean; message: string; data: { brand: any } }> => {
  const response = await adminAxiosInstance.post('/brands', data);
  return response.data;
};

export const updateBrand = async (id: string, data: Partial<CreateBrandData>): Promise<{ success: boolean; message: string; data: { brand: any } }> => {
  const response = await adminAxiosInstance.put(`/brands/${id}`, data);
  return response.data;
};

export const deleteBrand = async (id: string): Promise<AdminResponse> => {
  const response = await adminAxiosInstance.delete(`/brands/${id}`);
  return response.data;
};

// Banner Management
export const getAllBanners = async (filters?: BannerFilters): Promise<AdminBannersResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await adminAxiosInstance.get(`/admin/banners?${params.toString()}`);
  return response.data;
};

export const createBanner = async (data: CreateBannerData): Promise<BannerResponse> => {
  const response = await adminAxiosInstance.post('/admin/banners', data);
  return response.data;
};

export const updateBanner = async (id: string, data: Partial<CreateBannerData>): Promise<BannerResponse> => {
  const response = await adminAxiosInstance.put(`/admin/banners/${id}`, data);
  return response.data;
};

export const deleteBanner = async (id: string): Promise<AdminResponse> => {
  const response = await adminAxiosInstance.delete(`/admin/banners/${id}`);
  return response.data;
};

export const getBannerById = async (id: string): Promise<BannerResponse> => {
  const response = await adminAxiosInstance.get(`/admin/banners/${id}`);
  return response.data;
};