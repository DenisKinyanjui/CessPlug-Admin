import axiosInstance from '../utils/axiosInstance';
import { AxiosProgressEvent } from 'axios';

interface UploadResponse {
  success: boolean;
  message?: string;
  data: {
    url: string;
    public_id?: string;
    secure_url?: string;
  };
}

interface MultipleUploadResponse {
  success: boolean;
  message?: string;
  data: Array<{
    url: string;
    public_id?: string;
    secure_url?: string;
  }>;
}

interface DeleteResponse {
  success: boolean;
  message?: string;
}

// Upload single image
export const uploadImage = async (
  file: File, 
  folder?: string,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) formData.append('folder', folder);

  try {
    // Changed from '/upload' to '/upload/single' to match backend route
    const response = await axiosInstance.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress,
      isAdmin: true // Add this flag to use admin token
    });

    return {
      success: true,
      data: {
        url: response.data.data.secure_url || response.data.data.url,
        public_id: response.data.data.public_id
      }
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Upload failed',
      data: { url: '' }
    };
  }
};

// Upload multiple images
export const uploadImages = async (
  files: File[], 
  folder?: string,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<MultipleUploadResponse> => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  if (folder) formData.append('folder', folder);

  try {
    // Changed from '/upload/multiple' to '/upload/multiple' (this one was already correct)
    const response = await axiosInstance.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress,
      isAdmin: true // Add this flag to use admin token
    });

    return {
      success: true,
      data: response.data.data.map((item: any) => ({
        url: item.secure_url || item.url,
        public_id: item.public_id
      }))
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Upload failed',
      data: []
    };
  }
};

// Delete image
export const deleteImage = async (publicId: string): Promise<DeleteResponse> => {
  try {
    const response = await axiosInstance.delete('/upload', {
      data: { public_id: publicId },
      isAdmin: true // Add this flag to use admin token
    });

    return {
      success: true,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('Delete error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Delete failed'
    };
  }
};