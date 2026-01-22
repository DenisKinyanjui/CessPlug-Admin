// src/admin/categories/create.tsx
import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import BasicCategoryInfo from '../../../components/admin/categories/BasicCategoryInfo';
import { createCategory, getParentCategories, getCategoryById, updateCategory } from '../../../services/adminApi';
import { CreateCategoryData } from '../../../types/Category';
import { uploadImage } from '../../../services/upload';

interface FormData {
  name: string;
  slug: string;
  parentCategory: string;
  description: string;
  image: string;
  imageFile: File | null;
  status: 'active' | 'inactive';
}

const CreateCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    parentCategory: '',
    description: '',
    image: '',
    imageFile: null,
    status: 'active'
  });

  const [parentCategories, setParentCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load parent categories
        const parentResponse = await getParentCategories();
        setParentCategories(parentResponse.data.categories.map(cat => ({
          id: cat.id,
          name: cat.name
        })));

        // If in edit mode, load the category data
        if (id) {
          setIsEditing(true);
          const categoryResponse = await getCategoryById(id);
          const category = categoryResponse.data.category;
          
          setFormData({
            name: category.name,
            slug: category.slug,
            parentCategory: category.parent?.id || '',
            description: category.description || '',
            image: category.image || '',
            imageFile: null,
            status: category.status
          });
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load category data');
      }
    };

    loadData();
  }, [id]);

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    if (formData.name.trim().length > 50) {
      errors.name = 'Category name cannot be more than 50 characters';
    }

    if (formData.description.trim().length > 500) {
      errors.description = 'Description cannot be more than 500 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let imageUrl = formData.image;
      
      // Only upload new image if a file was selected
      if (formData.imageFile) {
        const uploadResponse = await uploadImage(formData.imageFile, 'category_images');
        if (!uploadResponse.success) {
          throw new Error(uploadResponse.message || 'Image upload failed');
        }
        imageUrl = uploadResponse.data.url;
      }

      const categoryData: CreateCategoryData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        image: imageUrl,
        parentCategory: formData.parentCategory || null,
        status: formData.status
      };

      let response;
      if (isEditing && id) {
        response = await updateCategory(id, categoryData);
      } else {
        response = await createCategory(categoryData);
      }
      
      if (response.success) {
        navigate('/admin/categories', { 
          state: { 
            message: `Category ${isEditing ? 'updated' : 'created'} successfully!`,
            type: 'success'
          } 
        });
      } else {
        setError(response.message || `Failed to ${isEditing ? 'update' : 'create'} category`);
      }
    } catch (error: any) {
      console.error('Category operation error:', error);
      const errorMessage = error.response?.data?.message || error.message || `Failed to ${isEditing ? 'update' : 'create'} category`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/categories');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setValidationErrors(prev => ({
          ...prev,
          image: 'Image size must be less than 10MB'
        }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setValidationErrors(prev => ({
          ...prev,
          image: 'Please select a valid image file'
        }));
        return;
      }

      // Clear any previous image errors
      setValidationErrors(prev => {
        const { image, ...rest } = prev;
        return rest;
      });

      const url = URL.createObjectURL(file);
      setFormData(prev => ({ 
        ...prev, 
        image: url,
        imageFile: file 
      }));
    }
  };

  const handleImageRemove = () => {
    setFormData(prev => ({ 
      ...prev, 
      image: '',
      imageFile: null 
    }));
    setValidationErrors(prev => {
      const { image, ...rest } = prev;
      return rest;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update this category' : 'Create a new category for organizing products'}
          </p>
        </div>
        <button
          onClick={handleCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <BasicCategoryInfo
          formData={formData}
          parentCategories={parentCategories}
          handleImageUpload={handleImageUpload}
          handleImageRemove={handleImageRemove}
          setFormData={setFormData}
          validationErrors={validationErrors}
          disabled={isLoading}
        />

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || Object.keys(validationErrors).length > 0}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isLoading 
              ? isEditing 
                ? 'Updating...' 
                : 'Creating...' 
              : isEditing 
                ? 'Update Category' 
                : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategoryPage;