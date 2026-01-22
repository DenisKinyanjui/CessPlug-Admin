import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Plus, X } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  customFields?: CustomField[];
}

interface Brand {
  _id: string;
  name: string;
  slug: string;
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

// Updated interface to properly handle populated objects
interface InitialProductData {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  category?: string | { _id: string; name: string; slug: string };
  brand?: string | { _id: string; name: string; slug: string };
  stock?: number;
  tags?: string[];
  images?: string[];
  specifications?: { [key: string]: any };
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  status?: 'active' | 'inactive';
}

interface ProductFormProps {
  initialData?: InitialProductData;
  categories: Category[];
  brands: Brand[];
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  brands,
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false
}) => {
  // Helper function to extract ObjectId from category or brand
  const extractObjectId = (value: string | { _id: string; [key: string]: any } | undefined): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value._id) return value._id;
    return '';
  };

  // Initialize form data with proper type handling
  const [formData, setFormData] = useState<ProductFormData>(() => {
    const initialFormData: ProductFormData = {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      originalPrice: initialData?.originalPrice || 0,
      category: extractObjectId(initialData?.category),
      brand: extractObjectId(initialData?.brand),
      stock: initialData?.stock || 0,
      tags: initialData?.tags || [],
      images: initialData?.images || [],
      specifications: initialData?.specifications || {},
      isFeatured: initialData?.isFeatured || false,
      isNewArrival: initialData?.isNewArrival || false,
      isBestSeller: initialData?.isBestSeller || false,
      status: initialData?.status || 'active'
    };
    return initialFormData;
  });

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryFieldsLoading, setCategoryFieldsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Update formData when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name || prev.name,
        slug: initialData.slug || prev.slug,
        description: initialData.description || prev.description,
        price: initialData.price || prev.price,
        originalPrice: initialData.originalPrice || prev.originalPrice,
        category: extractObjectId(initialData.category),
        brand: extractObjectId(initialData.brand),
        stock: initialData.stock || prev.stock,
        tags: initialData.tags || prev.tags,
        images: initialData.images || prev.images,
        specifications: initialData.specifications || prev.specifications,
        isFeatured: initialData.isFeatured !== undefined ? initialData.isFeatured : prev.isFeatured,
        isNewArrival: initialData.isNewArrival !== undefined ? initialData.isNewArrival : prev.isNewArrival,
        isBestSeller: initialData.isBestSeller !== undefined ? initialData.isBestSeller : prev.isBestSeller,
        status: initialData.status || prev.status
      }));
    }
  }, [initialData]);

  // Initialize selected category based on form data
  useEffect(() => {
    if (formData.category && categories.length > 0) {
      const category = categories.find(c => c._id === formData.category);
      setSelectedCategory(category || null);
    } else {
      setSelectedCategory(null);
    }
  }, [formData.category, categories]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleFieldChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug when name changes
    if (field === 'name' && value) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCategoryChange = async (categoryId: string) => {
    setCategoryFieldsLoading(true);
    
    try {
      setFormData(prev => ({
        ...prev,
        category: categoryId,
        specifications: categoryId ? {} : prev.specifications
      }));

      const category = categories.find(c => c._id === categoryId);
      setSelectedCategory(category || null);
    } catch (error) {
      console.error('Error handling category change:', error);
    } finally {
      setCategoryFieldsLoading(false);
    }
  };


  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const urls = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...urls]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.brand) newErrors.brand = 'Brand is required';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Valid stock quantity is required';

    // Validate category-specific fields
    if (selectedCategory?.customFields) {
      selectedCategory.customFields.forEach(field => {
        if (field.required && !formData.specifications[field.key]) {
          newErrors[`spec_${field.key}`] = `${field.label} is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Ensure we're sending the correct data types
      const submitData: ProductFormData = {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        stock: Number(formData.stock)
      };
      
      console.log('Submitting form data:', submitData);
      console.log('Category ID:', submitData.category);
      console.log('Brand ID:', submitData.brand);
      
      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product name"
              disabled={loading}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleFieldChange('slug', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.slug ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="product-slug"
              disabled={loading}
            />
            {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug}</p>}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleFieldChange('price', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
              disabled={loading}
            />
            {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
          </div>

          {/* Original Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.originalPrice}
              onChange={(e) => handleFieldChange('originalPrice', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.brand}
              onChange={(e) => handleFieldChange('brand', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.brand ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Select brand</option>
              {brands.map(brand => (
                <option key={brand._id} value={brand._id}>{brand.name}</option>
              ))}
            </select>
            {errors.brand && <p className="text-sm text-red-500 mt-1">{errors.brand}</p>}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => handleFieldChange('stock', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.stock ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              disabled={loading}
            />
            {errors.stock && <p className="text-sm text-red-500 mt-1">{errors.stock}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleFieldChange('status', e.target.value as 'active' | 'inactive')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter product description"
            disabled={loading}
          />
        </div>

        {/* Tags */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  disabled={loading}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInput}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type a tag and press Enter"
            disabled={loading}
          />
        </div>

        {/* Product Features */}
        <div className="mt-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">Product Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Featured */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => handleFieldChange('isFeatured', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                Featured Product
              </label>
            </div>

            {/* New Arrival */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isNewArrival"
                checked={formData.isNewArrival}
                onChange={(e) => handleFieldChange('isNewArrival', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="isNewArrival" className="ml-2 block text-sm text-gray-900">
                New Arrival
              </label>
            </div>

            {/* Best Seller */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isBestSeller"
                checked={formData.isBestSeller}
                onChange={(e) => handleFieldChange('isBestSeller', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="isBestSeller" className="ml-2 block text-sm text-gray-900">
                Best Seller
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Category Fields */}
      {selectedCategory && selectedCategory.customFields && selectedCategory.customFields.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedCategory.name} Specifications
            </h2>
            {categoryFieldsLoading && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            )}
          </div>

          
        </div>
      )}

      {/* Show message if category is selected but has no custom fields */}
      {selectedCategory && (!selectedCategory.customFields || selectedCategory.customFields.length === 0) && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedCategory.name} Specifications
          </h2>
          <p className="text-gray-500 text-sm">No custom fields defined for this category.</p>
        </div>
      )}

      {/* Product Images */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={loading}
              />
            </label>
          </div>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={`image-${index}`} className="relative">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    disabled={loading}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              {isEdit ? 'Update Product' : 'Create Product'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};1

export default ProductForm;