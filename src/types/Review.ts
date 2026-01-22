// Review.ts - Updated to match backend data structure
export interface Review {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: string[];
  } | string; // Can be populated or just ID
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  name: string;
  rating: number;
  comment: string;
  title?: string;
  verified: boolean;
  helpful: number;
  visible?: boolean;  // Added as optional since it defaults to true
  flagged?: boolean;  // Added as optional since it defaults to false
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: {
    [key: number]: number;
  };
}

export interface Product {
  _id: string;
  name: string;
  images: string[];
}

export interface CreateReviewData {
  rating: number;
  comment: string;
  title?: string;
}