import axiosInstance from '../utils/axiosInstance';
import { Review, ReviewsResponse, CreateReviewData, ReviewStats } from '../types/Review';

// Regular user review APIs
export const getProductReviews = async (productId: string, page?: number, limit?: number): Promise<ReviewsResponse> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  
  const response = await axiosInstance.get(`/reviews/${productId}?${params.toString()}`);
  return response.data;
};

export const createReview = async (productId: string, data: CreateReviewData): Promise<{ success: boolean; message: string; data: { review: Review } }> => {
  const response = await axiosInstance.post(`/reviews/${productId}`, data);
  return response.data;
};

export const deleteReview = async (reviewId: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.delete(`/reviews/${reviewId}`);
  return response.data;
};

export const canReviewProduct = async (productId: string): Promise<{ success: boolean; canReview: boolean; reason?: string }> => {
  const response = await axiosInstance.get(`/reviews/${productId}/can-review`);
  return response.data;
};

// Admin review APIs - Fixed routes
export const getAllReviews = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ReviewsResponse> => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  // Fixed: Changed from /admin/reviews to /reviews/admin/all
  const response = await axiosInstance.get(`/reviews/admin/all?${queryParams.toString()}`, { isAdmin: true });
  return response.data;
};

export const getReviewStats = async (): Promise<{ success: boolean; data: ReviewStats }> => {
  // Fixed: Changed from /admin/reviews/stats to /reviews/admin/stats
  const response = await axiosInstance.get('/reviews/admin/stats', { isAdmin: true });
  return response.data;
};

export const updateReviewVisibility = async (reviewId: string, visible: boolean): Promise<{ success: boolean; message: string }> => {
  // Fixed: Changed from /admin/reviews/:id/visibility to /reviews/admin/:id/visibility
  const response = await axiosInstance.patch(`/reviews/admin/${reviewId}/visibility`, { visible }, { isAdmin: true });
  return response.data;
};

export const flagReview = async (reviewId: string, flagged: boolean): Promise<{ success: boolean; message: string }> => {
  // Fixed: Changed from /admin/reviews/:id/flag to /reviews/admin/:id/flag
  const response = await axiosInstance.patch(`/reviews/admin/${reviewId}/flag`, { flagged }, { isAdmin: true });
  return response.data;
};

export const deleteReviewAdmin = async (reviewId: string): Promise<{ success: boolean; message: string }> => {
  // Fixed: Changed from /admin/reviews/:id to /reviews/admin/:id (you'll need to add this route)
  const response = await axiosInstance.delete(`/reviews/admin/${reviewId}`, { isAdmin: true });
  return response.data;
};