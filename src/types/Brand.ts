// Updated Brand interface to match backend MongoDB model
export interface Brand {
  _id: string;
  name: string;
  slug: string;
  description: string; // Changed from optional to required
  logo: string; // Changed from optional to required
  website: string; // Changed from optional to required
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Response structure for multiple brands
export interface BrandsResponse {
  success: boolean;
  data: {
    brands: Brand[];
  };
}

// Data structure for creating a new brand
export interface CreateBrandData {
  name: string;
  description: string; // Make non-optional since your form initializes with empty string
  logo: string; // Make non-optional
  website: string; // Make non-optional
  isActive?: boolean; // Keep optional with proper type
}

// Data structure for updating a brand (all fields optional)
export interface UpdateBrandData extends Partial<CreateBrandData> {
  // Allow partial updates
}

// Response structure for single brand operations
export interface BrandResponse {
  success: boolean;
  message: string;
  data: {
    brand: Brand;
  };
}

// Response structure for delete operations
export interface DeleteBrandResponse {
  success: boolean;
  message: string;
}

// For search and filtering
export interface BrandFilters {
  search?: string;
  status?: 'active' | 'inactive';
}

// For form validation
export interface BrandFormData {
  name: string;
  description: string;
  logo: string;
  website: string;
  isActive: boolean;
}

// For brand statistics
export interface BrandStats {
  total: number;
  active: number;
  inactive: number;
}