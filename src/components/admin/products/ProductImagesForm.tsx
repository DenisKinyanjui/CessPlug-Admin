import React, { useState } from 'react';
import { Upload, Trash2, X, AlertCircle } from 'lucide-react';
import { uploadImages } from '../../../services/upload'; // Adjust path as needed

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

interface ProductImagesFormProps {
  formData: ProductFormData;
  loading: boolean;
  onImageUpload: (imageUrls: string[]) => void;
  onRemoveImage: (index: number) => void;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
}

const ProductImagesForm: React.FC<ProductImagesFormProps> = ({
  formData,
  loading,
  onImageUpload,
  onRemoveImage
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        setUploadError(`${file.name} is not a valid image file`);
        return false;
      }
      if (!isValidSize) {
        setUploadError(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadError(null);

    // Initialize progress tracking
    const initialProgress: UploadProgress[] = validFiles.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading' as const
    }));
    setUploadProgress(initialProgress);

    try {
      // Upload to Cloudinary using the upload service
      const uploadResult = await uploadImages(
        validFiles,
        'products', // folder name in Cloudinary
        (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            
            // Update progress for all files (simplified - in reality you'd track individual files)
            setUploadProgress(prev => 
              prev.map(item => ({
                ...item,
                progress: percentCompleted,
                status: percentCompleted === 100 ? 'success' : 'uploading'
              }))
            );
          }
        }
      );

      if (uploadResult.success && uploadResult.data.length > 0) {
        // Extract URLs from the upload result
        const newImageUrls = uploadResult.data.map(item => item.url);
        
        // Update progress to success
        setUploadProgress(prev => 
          prev.map(item => ({
            ...item,
            progress: 100,
            status: 'success'
          }))
        );

        // Pass the new URLs to the parent component
        onImageUpload(newImageUrls);

        // Clear progress after a delay
        setTimeout(() => {
          setUploadProgress([]);
        }, 2000);

      } else {
        throw new Error(uploadResult.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload images');
      
      // Update progress to error
      setUploadProgress(prev => 
        prev.map(item => ({
          ...item,
          status: 'error'
        }))
      );
      
      // Clear progress after delay
      setTimeout(() => {
        setUploadProgress([]);
      }, 3000);
    } finally {
      setUploading(false);
      // Clear the input value so the same files can be selected again
      e.target.value = '';
    }
  };

  const clearUploadError = () => {
    setUploadError(null);
  };

  const isUploadDisabled = loading || uploading;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
      
      <div className="space-y-4">
        {/* Upload Error Display */}
        {uploadError && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{uploadError}</span>
            </div>
            <button
              onClick={clearUploadError}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Upload Area */}
        <div className="flex items-center justify-center w-full">
          <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isUploadDisabled 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className={`w-8 h-8 mb-2 ${
                isUploadDisabled ? 'text-gray-300' : 'text-gray-500'
              }`} />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">
                  {uploading ? 'Uploading...' : 'Click to upload'}
                </span>
                {!uploading && ' or drag and drop'}
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileSelection}
              disabled={isUploadDisabled}
            />
          </label>
        </div>

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Upload Progress</h3>
            {uploadProgress.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700 truncate">{item.fileName}</span>
                  <span className={`text-xs font-medium ${
                    item.status === 'success' ? 'text-green-600' :
                    item.status === 'error' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {item.status === 'success' ? 'Complete' :
                     item.status === 'error' ? 'Failed' :
                     `${item.progress}%`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      item.status === 'success' ? 'bg-green-500' :
                      item.status === 'error' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Previews */}
        {formData.images.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">
              Uploaded Images ({formData.images.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={`image-${index}`} className="relative group">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => onRemoveImage(index)}
                      className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                      disabled={loading}
                      title="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Image index indicator */}
                  <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs rounded px-1">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Instructions */}
        {formData.images.length === 0 && !uploading && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              No images uploaded yet. Add some product images to showcase your product.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImagesForm;