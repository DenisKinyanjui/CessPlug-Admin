// Updated types/Product.ts - Fixed sorting types and enhanced with pagination

export interface Product {
  soldCount: number;
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount: number;
  images: string[];
  brand: {
    _id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  stock: number;
  tags: string[];
  rating: number;
  numReviews: number;
  isFlashDeal: boolean;
  flashEndsAt?: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  specifications?: { [key: string]: any }; // Legacy field for backward compatibility
  specs?: { [key: string]: string | number }; // New dynamic specs field
  features?: string[];
  status: 'active' | 'inactive';
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Virtual field calculated on frontend
export interface ProductWithFinalPrice extends Product {
  finalPrice: number;
}

// Enhanced sort options to include all backend supported options
export type ProductSortBy = 
  | 'price_low' 
  | 'price_high' 
  | 'rating' 
  | 'newest' 
  | 'name' 
  | 'popularity' 
  | 'stock_low' 
  | 'stock_high' 
  | 'oldest';

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  flashDeals?: boolean;
  featured?: boolean;
  newArrivals?: boolean;
  bestSellers?: boolean;
  status?: 'active' | 'inactive';
  sortBy?: ProductSortBy;
  page?: number;
  limit?: number;
  // Dynamic spec filters (any additional query params become spec filters)
  [key: string]: any;
}

// Enhanced filters interface for better type safety
export interface EnhancedProductFilters extends Omit<ProductFilters, 'sortBy'> {
  sortBy?: ProductSortBy;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ProductResponse {
  message: string;
  success: boolean;
  data: {
    product: Product;
  };
}

// Updated CreateProductData to match backend expectations
export interface CreateProductData {
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
  specifications?: { [key: string]: any }; // Legacy field
  specs?: { [key: string]: string | number }; // New dynamic specs field
  features?: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  status: 'active' | 'inactive';
}

// Form data interfaces for admin panels
export interface ProductFormSpec {
  name: string;
  value: string | number;
  required?: boolean;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string | number;
  originalPrice?: string | number;
  discount?: string | number;
  images: string[];
  brand: string;
  category: string;
  stock: string | number;
  tags: string[];
  specs?: ProductFormSpec[] | { [key: string]: string | number }; // Flexible format
  features?: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  status: 'active' | 'inactive';
}

// Available specs response from backend
export interface AvailableSpecsResponse {
  success: boolean;
  data: {
    specs: Array<{
      name: string;
      values: (string | number)[];
    }>;
  };
}

// Spec values response for a specific spec
export interface SpecValuesResponse {
  success: boolean;
  data: {
    specName: string;
    values: (string | number)[];
  };
}

// Utility type for form validation
export interface ProductValidationError {
  field: string;
  message: string;
}

// Helper interface for dynamic spec management in forms
export interface DynamicSpecField {
  id: string; // Unique ID for React keys
  name: string;
  value: string | number;
  type?: 'text' | 'number' | 'select';
  options?: (string | number)[];
  required?: boolean;
  placeholder?: string;
}

// Category-specific spec suggestions (optional)
export interface CategorySpecSuggestion {
  name: string;
  type: 'text' | 'number' | 'select';
  options?: (string | number)[];
  required?: boolean;
  placeholder?: string;
  unit?: string;
}

export interface CategorySpecSuggestionsResponse {
  success: boolean;
  data: {
    suggestions: CategorySpecSuggestion[];
  };
}

// Product statistics interface for admin dashboard
export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  lowStock: number;
  outOfStock: number;
  featured: number;
  newArrivals: number;
  bestSellers: number;
}

export interface ProductStatsResponse {
  success: boolean;
  data: ProductStats;
}

// Export utility functions for working with specs
export class ProductSpecUtils {
  /**
   * Convert form specs array to backend key-value format
   */
  static specsArrayToObject(specs: ProductFormSpec[]): { [key: string]: string | number } {
    const result: { [key: string]: string | number } = {};
    
    specs.forEach(spec => {
      if (spec.name && spec.value !== undefined && spec.value !== '') {
        result[spec.name] = spec.value;
      }
    });
    
    return result;
  }

  /**
   * Convert backend key-value specs to form array format
   */
  static specsObjectToArray(specs: { [key: string]: string | number }): ProductFormSpec[] {
    return Object.entries(specs || {}).map(([name, value]) => ({
      name,
      value
    }));
  }

  /**
   * Generate dynamic spec fields for form management
   */
  static generateDynamicFields(specs: { [key: string]: string | number } = {}): DynamicSpecField[] {
    return Object.entries(specs).map(([name, value], index) => ({
      id: `spec-${index}-${name}`,
      name,
      value,
      type: typeof value === 'number' ? 'number' : 'text'
    }));
  }

  /**
   * Add empty spec field for form
   */
  static createEmptySpecField(id?: string): DynamicSpecField {
    return {
      id: id || `spec-${Date.now()}-${Math.random()}`,
      name: '',
      value: '',
      type: 'text'
    };
  }

  /**
   * Validate specs data
   */
  static validateSpecs(specs: DynamicSpecField[]): ProductValidationError[] {
    const errors: ProductValidationError[] = [];
    const names = new Set<string>();

    specs.forEach((spec, index) => {
      if (!spec.name.trim()) {
        errors.push({
          field: `specs[${index}].name`,
          message: 'Spec name is required'
        });
      } else if (names.has(spec.name.trim())) {
        errors.push({
          field: `specs[${index}].name`,
          message: 'Duplicate spec names are not allowed'
        });
      } else {
        names.add(spec.name.trim());
      }

      if (spec.value === undefined || spec.value === '') {
        errors.push({
          field: `specs[${index}].value`,
          message: 'Spec value is required'
        });
      }
    });

    return errors;
  }

  /**
   * Get sort option display name
   */
  static getSortDisplayName(sortBy: ProductSortBy): string {
    const sortNames: Record<ProductSortBy, string> = {
      price_low: 'Price: Low to High',
      price_high: 'Price: High to Low',
      rating: 'Highest Rated',
      newest: 'Newest First',
      name: 'Name: A to Z',
      popularity: 'Most Popular',
      stock_low: 'Stock: Low to High',
      stock_high: 'Stock: High to Low',
      oldest: 'Oldest First'
    };
    return sortNames[sortBy] || sortBy;
  }

  /**
   * Get available sort options
   */
  static getSortOptions(): Array<{ value: ProductSortBy; label: string }> {
    return [
      { value: 'newest', label: 'Newest First' },
      { value: 'oldest', label: 'Oldest First' },
      { value: 'name', label: 'Name: A to Z' },
      { value: 'price_low', label: 'Price: Low to High' },
      { value: 'price_high', label: 'Price: High to Low' },
      { value: 'rating', label: 'Highest Rated' },
      { value: 'popularity', label: 'Most Popular' },
      { value: 'stock_high', label: 'Stock: High to Low' },
      { value: 'stock_low', label: 'Stock: Low to High' }
    ];
  }
}