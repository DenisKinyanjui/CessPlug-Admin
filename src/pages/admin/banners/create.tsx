import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, X, Upload, Link as LinkIcon, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';
import { useAdmin } from '../../../contexts/AdminContext';
import { getBannerById } from '../../../services/adminApi';

interface BannerFormData {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  buttonText: string;
  position: 'hero' | 'category' | 'promotion' | 'footer';
  isActive: boolean;
  startDate: string;
  endDate: string;
  priority: number;
}

interface NotificationState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

const CreateBannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bannerId = searchParams.get('id');
  const isEdit = Boolean(bannerId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated, isAdmin } = useAdmin();
  
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    buttonText: 'Shop Now',
    position: 'hero',
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    priority: 0
  });

  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'success',
    message: ''
  });

  // Load banner data for editing
  useEffect(() => {
    if (isEdit && bannerId) {
      loadBannerData(bannerId);
    }
  }, [isEdit, bannerId]);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const loadBannerData = async (id: string) => {
  setPageLoading(true);
  try {
    const response = await getBannerById(id); // Use the new API function
    if (response.success) {
      const banner = response.data.banner;
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        image: banner.image || '',
        link: banner.link || '',
        buttonText: banner.buttonText || 'Shop Now',
        position: banner.position || 'hero',
        isActive: banner.isActive !== undefined ? banner.isActive : true,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
        priority: banner.priority || 0
      });
    }
  } catch (error: any) {
    console.error('Error loading banner:', error);
    showNotification('error', 'Failed to load banner data');
  } finally {
    setPageLoading(false);
  }
};

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      showNotification('error', 'Banner title is required');
      return false;
    }

    if (!formData.image) {
      showNotification('error', 'Banner image is required');
      return false;
    }

    if (formData.link && !isValidUrl(formData.link)) {
      showNotification('error', 'Please enter a valid URL');
      return false;
    }

    if (formData.endDate && formData.startDate > formData.endDate) {
      showNotification('error', 'End date must be after start date');
      return false;
    }

    return true;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Client-side validation
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    showNotification('error', 'Only JPEG, PNG, and GIF files are allowed');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showNotification('error', 'File size must be less than 10MB');
    return;
  }

  setUploadLoading(true);
  
  try {
    const formData = new FormData();
    formData.append('file', file); // This matches the backend field name
    formData.append('folder', 'banners'); // Specify folder in Cloudinary

    // Upload to your server endpoint which then uploads to Cloudinary
    const response = await axiosInstance.post('/upload/single', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  isAdmin: true // Add this to ensure admin token is used
});

    if (response.data.success) {
      // Get the image URL from the response
      const imageUrl = response.data.data.secure_url || response.data.data.url;
      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }

      setFormData(prev => ({ 
        ...prev, 
        image: imageUrl
      }));
      showNotification('success', 'Image uploaded successfully');
    } else {
      throw new Error(response.data.message || 'Upload failed');
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      showNotification('error', 'Authentication required. Please login again.');
      // Redirect to admin login
      navigate('/admin/login');
    } else if (error.response?.status === 403) {
      showNotification('error', 'Access denied. Admin privileges required.');
    } else if (error.response?.status === 413) {
      showNotification('error', 'File too large. Maximum size is 10MB.');
    } else {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image';
      showNotification('error', errorMessage);
    }
  } finally {
    setUploadLoading(false);
  }
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare banner data for API
      const bannerData = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || undefined,
        image: formData.image,
        link: formData.link.trim() || undefined,
        buttonText: formData.buttonText.trim() || 'Shop Now',
        position: formData.position,
        isActive: formData.isActive,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        priority: Number(formData.priority) || 0
      };

      let response;
      if (isEdit && bannerId) {
        response = await axiosInstance.put(`/admin/banners/${bannerId}`, bannerData);
      } else {
        response = await axiosInstance.post('/admin/banners', bannerData);
      }

      if (response.data.success) {
        showNotification('success', 
          isEdit ? 'Banner updated successfully' : 'Banner created successfully'
        );
        
        // Reset form if creating new banner
        if (!isEdit) {
          setFormData({
            title: '',
            subtitle: '',
            image: '',
            link: '',
            buttonText: 'Shop Now',
            position: 'hero',
            isActive: true,
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            priority: 0
          });
          
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
        
        // Navigate back to banners list after a short delay
        setTimeout(() => {
          navigate('/admin/banners');
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Failed to save banner');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save banner';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof BannerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Banner' : 'Add New Banner'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update banner information' : 'Create a new promotional banner'}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/banners')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading || uploadLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Banner Information</h2>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter banner title"
                required
                maxLength={100}
                disabled={loading}
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter banner subtitle"
                maxLength={200}
                disabled={loading}
              />
            </div>

            {/* Button Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => handleFieldChange('buttonText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter button text"
                disabled={loading}
              />
            </div>

            {/* Link URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link URL
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleFieldChange('link', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Position and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => handleFieldChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="hero">Hero</option>
                  <option value="category">Category</option>
                  <option value="promotion">Promotion</option>
                  <option value="footer">Footer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleFieldChange('priority', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Priority number"
                  min="0"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Start and End Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleFieldChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleFieldChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={formData.startDate}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active Banner
              </label>
            </div>
          </div>
        </div>

        {/* Banner Image */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Banner Image *</h2>
          
          <div className="space-y-4">
            {!formData.image ? (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadLoading ? (
                      <Loader className="w-8 h-8 mb-2 text-blue-500 animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    )}
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">
                        {uploadLoading ? 'Uploading...' : 'Click to upload'}
                      </span>
                      {!uploadLoading && ' banner image'}
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadLoading || loading}
                  />
                </label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={formData.image}
                  alt="Banner preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/banners')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={loading || uploadLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading || uploadLoading || !formData.image}
          >
            {loading ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Saving...' : (isEdit ? 'Update Banner' : 'Create Banner')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBannerPage;