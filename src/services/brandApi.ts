import axiosInstance from '../utils/axiosInstance';
import {  
  BrandsResponse, 
  CreateBrandData, 
  UpdateBrandData, 
  BrandResponse, 
  DeleteBrandResponse 
} from '../types/Brand';

// Get all brands (public route - only active brands)
export const getAllBrands = async (): Promise<BrandsResponse> => {
  const response = await axiosInstance.get('/brands');
  return response.data;
};

// Get all brands for admin (includes inactive brands)
export const getAdminBrands = async (): Promise<BrandsResponse> => {
  const response = await axiosInstance.get('/brands/admin/all', {
    isAdmin: true
  });
  return response.data;
};

// Get single brand by ID
export const getBrandById = async (id: string): Promise<BrandResponse> => {
  const response = await axiosInstance.get(`/brands/${id}`);
  return response.data;
};

// Create new brand (admin only)
export const createBrand = async (data: CreateBrandData): Promise<BrandResponse> => {
  const response = await axiosInstance.post('/brands', data, {
    isAdmin: true
  });
  return response.data;
};

// Update brand (admin only)
export const updateBrand = async (id: string, data: UpdateBrandData): Promise<BrandResponse> => {
  const response = await axiosInstance.put(`/brands/${id}`, data, {
    isAdmin: true
  });
  return response.data;
};

// Delete brand (admin only) - this performs soft delete by setting isActive to false
export const deleteBrand = async (id: string): Promise<DeleteBrandResponse> => {
  const response = await axiosInstance.delete(`/brands/${id}`, {
    isAdmin: true
  });
  return response.data;
};

// Toggle brand status (admin only)
export const toggleBrandStatus = async (id: string, isActive: boolean): Promise<BrandResponse> => {
  const response = await axiosInstance.put(`/brands/${id}`, { isActive }, {
    isAdmin: true
  });
  return response.data;
};

// Search brands with query parameters
export const searchBrands = async (query: string, includeInactive: boolean = false): Promise<BrandsResponse> => {
  const endpoint = includeInactive ? '/brands/admin/all' : '/brands';
  const config = includeInactive ? { isAdmin: true } : {};
  const response = await axiosInstance.get(`${endpoint}?search=${encodeURIComponent(query)}`, config);
  return response.data;
};

// Search brands by status
export const getBrandsByStatus = async (status: 'active' | 'inactive'): Promise<BrandsResponse> => {
  const response = await axiosInstance.get(`/brands/admin/all?status=${status}`, {
    isAdmin: true
  });
  return response.data;
};