import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, X, Upload, Loader2 } from 'lucide-react';
import { createBrand, updateBrand, getAllBrands } from '../../../services/brandApi';
import { uploadImage, deleteImage } from '../../../services/upload';
import { CreateBrandData, Brand } from '../../../types/Brand';

const CreateBrandPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const brandId = searchParams.get('id');
  const isEdit = Boolean(brandId);
  
  const [formData, setFormData] = useState<CreateBrandData>({
    name: '',
    description: '',
    logo: '',
    website: '',
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentLogoPublicId, setCurrentLogoPublicId] = useState<string | null>(null);

  // Load brand data for editing
  useEffect(() => {
    if (isEdit && brandId) {
      loadBrandData(brandId);
    }
  }, [isEdit, brandId]);

const loadBrandData = async (id: string) => {
  try {
    setLoading(true);
    const response = await getAllBrands();
    const brand = response.data.brands.find((b: Brand) => b._id === id);
    
    if (brand) {
      setFormData({
        name: brand.name,
        description: brand.description || '',
        logo: brand.logo || '',
        website: brand.website || '',
        isActive: brand.isActive
      });
    } else {
      setError('Brand not found');
    }
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to load brand data');
  } finally {
    setLoading(false);
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setSuccess(null);

  if (!formData.name.trim()) {
    setError('Brand name is required');
    return;
  }

  try {
    setLoading(true);
    
    const dataToSend = {
      ...formData,
      isActive: formData.isActive ?? true
    };
    
    if (isEdit && brandId) {
      const response = await updateBrand(brandId, dataToSend);
      setSuccess(response.message);
    } else {
      const response = await createBrand(dataToSend);
      setSuccess(response.message);
    }
    
    setTimeout(() => {
      navigate('/admin/brands');
    }, 1500);
  } catch (err: any) {
    setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} brand`);
  } finally {
    setLoading(false);
  }
};

const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    setError('File size must be less than 10MB');
    return;
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    setError('Please select a valid image file');
    return;
  }

  try {
    setUploadLoading(true);
    setUploadProgress(0);
    setError(null);

    // Delete previous logo if exists
    if (currentLogoPublicId) {
      await deleteImage(currentLogoPublicId);
    }

    // Upload new logo to Cloudinary
    const uploadResult = await uploadImage(
      file,
      'brands', // folder name for brand logos
      (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      }
    );

    if (uploadResult.success && uploadResult.data.url) {
      setFormData(prev => ({ ...prev, logo: uploadResult.data.url }));
      setCurrentLogoPublicId(uploadResult.data.public_id || null);
      setSuccess('Logo uploaded successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(uploadResult.message || 'Failed to upload logo');
    }
  } catch (err: any) {
    console.error('Upload error:', err);
    setError('Failed to upload logo. Please try again.');
  } finally {
    setUploadLoading(false);
    setUploadProgress(0);
  }
};

const handleRemoveLogo = async () => {
  try {
    if (currentLogoPublicId) {
      setUploadLoading(true);
      await deleteImage(currentLogoPublicId);
      setCurrentLogoPublicId(null);
    }
    
    setFormData(prev => ({ ...prev, logo: '' }));
    setSuccess('Logo removed successfully');
    setTimeout(() => setSuccess(null), 3000);
  } catch (err: any) {
    console.error('Delete error:', err);
    setError('Failed to remove logo');
  } finally {
    setUploadLoading(false);
  }
};

  const handleInputChange = (field: keyof CreateBrandData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleCancel = () => {
    navigate('/admin/brands');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Brand' : 'Add New Brand'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update brand information' : 'Create a new brand for your products'}
          </p>
        </div>
        <button
          onClick={handleCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading || uploadLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {success}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Brand Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter brand name"
                required
                disabled={loading || uploadLoading}
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum 50 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter brand description"
                disabled={loading || uploadLoading}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum 500 characters ({formData.description.length}/500)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://www.example.com"
                disabled={loading || uploadLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Brand's official website
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Brand Logo</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${uploadLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploadLoading ? (
                    <>
                      <Loader2 className="w-8 h-8 mb-2 text-blue-500 animate-spin" />
                      <p className="text-sm text-gray-500">
                        Uploading... {uploadProgress}%
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> brand logo
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={loading || uploadLoading}
                />
              </label>
            </div>

            {/* Upload Progress Bar */}
            {uploadLoading && uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            {formData.logo && (
              <div className="mt-4">
                <img
                  src={formData.logo}
                  alt="Brand logo preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                  disabled={loading || uploadLoading}
                >
                  {uploadLoading ? 'Removing...' : 'Remove logo'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading || uploadLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || uploadLoading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Saving...' : (isEdit ? 'Update Brand' : 'Create Brand')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBrandPage;