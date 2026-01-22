import React from 'react';
import DynamicFieldRenderer from './DynamicFieldRenderer';

interface Category {
  _id: string;
  name: string;
  slug: string;
  customFields?: CustomField[];
}

interface CustomField {
  key: string;
  label: string;
  inputType: 'text' | 'number' | 'select' | 'multi-select' | 'boolean' | 'date';
  required?: boolean;
  options?: string[];
  order?: number;
  placeholder?: string;
  description?: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  brand: string;
  stock: number;
  tags: string[];
  images: string[];
  specifications: { [key: string]: any };
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  status: 'active' | 'inactive';
}

interface CategorySpecsFormProps {
  selectedCategory: Category | null;
  categoryFieldsLoading: boolean;
  formData: ProductFormData;
  errors: { [key: string]: string };
  onSpecificationChange: (key: string, value: string | number) => void;
}

const CategorySpecsForm: React.FC<CategorySpecsFormProps> = ({
  selectedCategory,
  categoryFieldsLoading,
  formData,
  errors,
  onSpecificationChange
}) => {
  if (!selectedCategory) {
    return null;
  }

  const sortedCustomFields = selectedCategory?.customFields
    ? [...selectedCategory.customFields].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  if (selectedCategory.customFields && selectedCategory.customFields.length > 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedCategory.name} Specifications
          </h2>
          {categoryFieldsLoading && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedCustomFields.map((field) => (
            <DynamicFieldRenderer
              key={`${selectedCategory._id}-${field.key}`}
              field={field}
              value={formData.specifications[field.key]}
              onChange={onSpecificationChange}
              error={errors[`spec_${field.key}`]}
            />
          ))}
        </div>
      </div>
    );
  }

  // Show message if category is selected but has no custom fields
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {selectedCategory.name} Specifications
      </h2>
      <p className="text-gray-500 text-sm">No custom fields defined for this category.</p>
    </div>
  );
};

export default CategorySpecsForm;