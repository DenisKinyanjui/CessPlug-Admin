// types/Category.ts
export interface CustomField {
  id?: string;
  label: string;
  key: string;
  inputType: 'text' | 'number' | 'select' | 'multi-select' | 'boolean' | 'date';
  options: string[];
  required: boolean;
  showInFilters: boolean;
  showInHighlights: boolean;
  order: number;
}

export interface Category {
  order: any;
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: {
    id: string;
    name: string;
    slug: string;
  };
  parentCategory?: string; // For form data
  status: 'active' | 'inactive';
  isActive: boolean;
  customFields: CustomField[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: {
    categories: Category[];
  };
}

export interface CategoryResponse {
  message: string;
  success: boolean;
  data: {
    category: Category;
  };
}

export interface ParentCategoriesResponse {
  success: boolean;
  data: {
    categories: Array<{ id: string; name: string; slug: string }>;
  };
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: string | null;
  status?: 'active' | 'inactive';
  customFields?: CustomField[];
}

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  parentCategory?: string | null;
  status?: 'active' | 'inactive';
  customFields?: CustomField[];
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  parentCategory?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}