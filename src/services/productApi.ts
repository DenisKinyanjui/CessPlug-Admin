// Updated productApi.ts - Admin Product Creation with Dynamic Specs

import axiosInstance from '../utils/axiosInstance';
import { Product, ProductFilters, ProductsResponse, ProductResponse, CreateProductData } from '../types/Product';

// Updated interface to include specs properly
export interface CreateProductFormData extends Omit<CreateProductData, 'specs'> {
  specs?: { [key: string]: string | number }; // Dynamic specs as key-value pairs
}

// Updated interface for product creation with proper specs handling
export interface AdminCreateProductData {
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  brand: string;
  category: string;
  stock: number;
  tags: string[];
  specifications?: { [key: string]: any }; // Legacy field for backward compatibility
  specs?: { [key: string]: string | number }; // New dynamic specs field
  features?: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  status: 'active' | 'inactive';
}

// Helper function to transform form data to API format
const transformProductData = (formData: any): AdminCreateProductData => {
  const transformedData: AdminCreateProductData = {
    name: formData.name?.trim(),
    slug: formData.slug?.trim(),
    description: formData.description?.trim(),
    price: Number(formData.price),
    originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
    discount: formData.discount ? Number(formData.discount) : 0,
    images: Array.isArray(formData.images) ? formData.images : [],
    brand: formData.brand,
    category: formData.category,
    stock: Number(formData.stock),
    tags: Array.isArray(formData.tags) ? formData.tags : [],
    features: Array.isArray(formData.features) ? formData.features : [],
    isFeatured: Boolean(formData.isFeatured),
    isNewArrival: Boolean(formData.isNewArrival),
    isBestSeller: Boolean(formData.isBestSeller),
    status: formData.status || 'active'
  };

  // Handle dynamic specs - convert form data to key-value object
  if (formData.specs) {
    const specs: { [key: string]: string | number } = {};
    
    if (Array.isArray(formData.specs)) {
      // If specs come as array of objects: [{ name: "RAM", value: "8GB" }]
      formData.specs.forEach((spec: any) => {
        if (spec.name && spec.value !== undefined && spec.value !== '') {
          specs[spec.name] = spec.value;
        }
      });
    } else if (typeof formData.specs === 'object') {
      // If specs come as key-value object: { "RAM": "8GB", "Storage": "256GB" }
      Object.entries(formData.specs).forEach(([key, value]) => {
        if (key && value !== undefined && value !== '') {
          specs[key] = value as string | number;
        }
      });
    }
    
    // Only add specs if we have valid entries
    if (Object.keys(specs).length > 0) {
      transformedData.specs = specs;
    }
  }

  // Handle legacy specifications field for backward compatibility
  if (formData.specifications && typeof formData.specifications === 'object') {
    transformedData.specifications = formData.specifications;
  }

  return transformedData;
};

// Validation helper for required fields
const validateProductData = (data: AdminCreateProductData): string[] => {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Product name is required');
  }

  if (!data.slug || data.slug.trim().length === 0) {
    errors.push('Product slug is required');
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push('Product description is required');
  }

  if (!data.price || data.price <= 0) {
    errors.push('Valid product price is required');
  }

  if (!data.brand) {
    errors.push('Product brand is required');
  }

  if (!data.category) {
    errors.push('Product category is required');
  }

  if (data.stock === undefined || data.stock < 0) {
    errors.push('Valid stock quantity is required');
  }

  if (!Array.isArray(data.images) || data.images.length === 0) {
    errors.push('At least one product image is required');
  }

  return errors;
};

// Updated createProduct function for admin
export const createProduct = async (formData: any): Promise<ProductResponse> => {
  try {
    // Transform and validate the form data
    const productData = transformProductData(formData);
    const validationErrors = validateProductData(productData);

    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }

    console.log('Creating product with data:', productData);

    // IMPORTANT: Ensure admin flag is set for the request
    const response = await axiosInstance.post('/products', productData, {
      isAdmin: true, // This is crucial for admin authentication
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Create product response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Create product error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // Enhanced error handling
    if (error.response?.status === 401) {
      throw new Error('Admin authentication failed. Please login as admin.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Admin privileges required.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to create product. Please check your input and try again.');
    }
  }
};

// Updated updateProduct function for admin
export const updateProduct = async (id: string, formData: any): Promise<ProductResponse> => {
  try {
    // Transform the form data (allow partial updates)
    const productData = transformProductData(formData);
    
    console.log('Updating product with data:', productData);

    const response = await axiosInstance.put(`/products/${id}`, productData, {
      isAdmin: true // Ensure this is an admin request
    });
    return response.data;
  } catch (error: any) {
    console.error('Update product error:', error);
    
    // Re-throw with better error message
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to update product. Please check your input and try again.');
    }
  }
};

// Existing functions remain the same...
export const getAllProducts = async (filters?: ProductFilters): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await axiosInstance.get(`/products?${params.toString()}`);
  return response.data;
};

export const getProductBySlug = async (slug: string): Promise<ProductResponse> => {
  const response = await axiosInstance.get(`/products/slug/${slug}`);
  return response.data;
};

export const getProductById = async (id: string): Promise<ProductResponse> => {
  const response = await axiosInstance.get(`/products/${id}`, {
    isAdmin: true
  });
  return response.data;
};

export const deleteProduct = async (id: string, hardDelete: boolean = false): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.delete(`/products/${id}`, {
    params: { hard: hardDelete },
    isAdmin: true
  });
  return response.data;
};

// Utility functions for different product types
export const searchProducts = async (query: string, filters?: Omit<ProductFilters, 'search'>): Promise<ProductsResponse> => {
  const searchFilters = { ...filters, search: query };
  return getAllProducts(searchFilters);
};

export const getProductsByCategory = async (categoryId: string, filters?: Omit<ProductFilters, 'category'>): Promise<ProductsResponse> => {
  const categoryFilters = { ...filters, category: categoryId };
  return getAllProducts(categoryFilters);
};

export const getProductsByBrand = async (brandId: string, filters?: Omit<ProductFilters, 'brand'>): Promise<ProductsResponse> => {
  const brandFilters = { ...filters, brand: brandId };
  return getAllProducts(brandFilters);
};

export const getFlashDeals = async (): Promise<ProductsResponse> => {
  const flashDealFilters = { flashDeals: true };
  return getAllProducts(flashDealFilters);
};

export const getFeaturedProducts = async (): Promise<ProductsResponse> => {
  const featuredFilters = { featured: true };
  return getAllProducts(featuredFilters);
};

export const getNewArrivals = async (): Promise<ProductsResponse> => {
  const newArrivalFilters = { newArrivals: true };
  return getAllProducts(newArrivalFilters);
};

export const getBestSellers = async (): Promise<ProductsResponse> => {
  const bestSellerFilters = { bestSellers: true };
  return getAllProducts(bestSellerFilters);
};

// New utility function to get available specs for filtering
export const getAvailableSpecs = async (filters?: { category?: string; brand?: string }) => {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.brand) params.append('brand', filters.brand);
    
    const response = await axiosInstance.get(`/products/specs?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching available specs:', error);
    throw error;
  }
};

// New utility function to get values for a specific spec
export const getSpecValues = async (specName: string, filters?: { category?: string; brand?: string }) => {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.brand) params.append('brand', filters.brand);
    
    const response = await axiosInstance.get(`/products/specs/${specName}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching spec values:', error);
    throw error;
  }
};