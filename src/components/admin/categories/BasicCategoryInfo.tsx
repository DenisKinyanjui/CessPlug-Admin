// src/components/admin/categories/BasicCategoryInfo.tsx
import React from 'react';
import { Upload, X } from 'lucide-react';

interface BasicCategoryInfoProps {
  formData: {
    name: string;
    slug: string;
    parentCategory: string;
    description: string;
    image: string;
    imageFile: File | null;
    status: 'active' | 'inactive';
  };
  parentCategories: Array<{ id: string; name: string; slug?: string }>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageRemove: () => void;
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    slug: string;
    parentCategory: string;
    description: string;
    image: string;
    imageFile: File | null;
    status: 'active' | 'inactive';
  }>>;
  validationErrors?: Record<string, string>;
  disabled?: boolean;
}

const BasicCategoryInfo: React.FC<BasicCategoryInfoProps> = ({
  formData,
  parentCategories,
  handleImageUpload,
  handleImageRemove,
  setFormData,
  validationErrors = {},
  disabled = false,
}) => {
  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    setFormData(prev => ({ ...prev, name, slug }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as 'active' | 'inactive';
    setFormData(prev => ({ ...prev, status }));
  };

  return (
    <>
      {/* Basic Category Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Category Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              className={`w-full px-3 py-2 border ${
                validationErrors.name ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Enter category name"
              disabled={disabled}
              required
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={handleSlugChange}
              className={`w-full px-3 py-2 border ${
                validationErrors.slug ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="category-slug"
              disabled={disabled}
              required
            />
            {validationErrors.slug && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.slug}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              URL-friendly version of the name (auto-generated from name)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent Category
            </label>
            <select
              value={formData.parentCategory}
              onChange={(e) => setFormData(prev => ({ ...prev, parentCategory: e.target.value }))}
              className={`w-full px-3 py-2 border ${
                validationErrors.parentCategory ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              disabled={disabled}
            >
              <option value="">None (Root Category)</option>
              {parentCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {validationErrors.parentCategory && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.parentCategory}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Select a parent category to create a subcategory
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={handleStatusChange}
              className={`w-full px-3 py-2 border ${
                validationErrors.status ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              disabled={disabled}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {validationErrors.status && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.status}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className={`w-full px-3 py-2 border ${
              validationErrors.description ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical`}
            placeholder="Enter category description (optional)"
            disabled={disabled}
          />
          {validationErrors.description && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Brief description of what this category contains
          </p>
        </div>
      </div>

      {/* Category Image */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Image</h2>
        
        <div className="space-y-4">
          {!formData.image ? (
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={disabled}
                />
              </label>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center justify-center w-full h-40 border-2 border-gray-200 rounded-lg bg-gray-50">
                <img
                  src={formData.image}
                  alt="Category preview"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
              <button
                type="button"
                onClick={handleImageRemove}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {validationErrors.image && (
            <p className="text-sm text-red-600">{validationErrors.image}</p>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Recommended size: 400x400px for best results
            </p>
            {formData.image && (
              <button
                type="button"
                onClick={() => {
                  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                  input?.click();
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                disabled={disabled}
              >
                Change Image
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BasicCategoryInfo;