
import React, { useState, useEffect } from "react";
import {
  Search,
  Star,
  Eye,
  EyeOff,
  Trash2,
  Flag,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  getAllReviews,
  getReviewStats,
  updateReviewVisibility,
  flagReview,
  deleteReviewAdmin,
} from "../../../services/reviewApi";
// import axiosInstance from '../../../utils/axiosInstance';
import Table from "../../../components/admin/Table";

// Types based on your provided files
interface Review {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: string[];
  };
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
  visible?: boolean;
  flagged?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReviewsResponse {
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

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: {
    [key: number]: number;
  };
}

const AdminReviewsManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Modal state
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showModal, setShowModal] = useState(false);

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      label: 'Reviewer',
      key: 'user.name',
      render: (review: Review) => (
        <div className="flex items-center space-x-2">
          {review?.user?.avatar && (
            <img
              src={review.user.avatar}
              alt={review.user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <div>
            <div className="font-medium">{review?.user?.name || 'Unknown User'}</div>
            <div className="text-sm text-gray-500">{review?.name}</div>
          </div>
        </div>
      ),
    },
    {
      label: 'Rating',
      key: 'rating',
      render: (review: Review) => (
        <div className="flex items-center space-x-2">
          {renderStars(review?.rating || 0)}
          <span className="text-sm font-medium">{review?.rating || 0}/5</span>
        </div>
      ),
    },
    {
      label: 'Review',
      key: 'comment',
      render: (review: Review) => (
        <div className="max-w-xs">
          {review?.title && (
            <div className="font-medium text-sm mb-1 line-clamp-1">
              {review.title}
            </div>
          )}
          <div className="text-sm text-gray-600 line-clamp-2">
            {review?.comment || 'No comment'}
          </div>
        </div>
      ),
    },
    {
      label: 'Product',
      key: 'product',
      render: (review: Review) => (
        <div className="flex items-center space-x-2">
          {review?.product?.images?.[0] && (
            <img
              src={review.product.images[0]}
              alt={review.product?.name || 'Product'}
              className="w-8 h-8 rounded object-cover"
            />
          )}
          <span className="text-sm line-clamp-1">
            {review?.product?.name || 'Unknown Product'}
          </span>
        </div>
      ),
    },
    {
      label: 'Date',
      key: 'createdAt',
      render: (review: Review) => (
        <div className="text-sm">
          {formatDate(review?.createdAt || new Date().toISOString())}
        </div>
      ),
    },
    {
      label: 'Status',
      key: 'visible',
      render: (review: Review) => (
        <div className="flex flex-col space-y-1">
          <span
            className={`px-2 py-1 rounded text-xs font-medium inline-block w-fit ${
              review?.visible !== false
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {review?.visible !== false ? 'Visible' : 'Hidden'}
          </span>
          {review?.flagged && (
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium inline-block w-fit">
              Flagged
            </span>
          )}
          {review?.verified && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium inline-block w-fit">
              Verified
            </span>
          )}
        </div>
      ),
    },
  ];

  // Fetch all reviews for admin
  const fetchAllReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(ratingFilter && { rating: ratingFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
      };

      const response = await getAllReviews(params);

      if (response.success) {
        // Ensure all reviews have the correct structure
        const transformedReviews = response.data.reviews.map((review) => ({
          ...review,
          // Ensure visible and flagged have default values
          visible: review.visible !== false, // Default to true if undefined
          flagged: review.flagged === true, // Default to false if undefined
          // Ensure user and product are objects
          user: review.user || { _id: '', name: 'Unknown User' },
          product: typeof review.product === "string"
            ? {
                _id: review.product,
                name: "Unknown Product",
                images: [],
              }
            : review.product || { _id: '', name: 'Unknown Product', images: [] },
        }));

        setReviews(transformedReviews);
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch reviews");
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch review statistics
  const fetchStats = async () => {
    try {
      const response = await getReviewStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Delete a review
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const response = await deleteReviewAdmin(reviewId);
      if (response.success) {
        setReviews((prev) => prev.filter((review) => review._id !== reviewId));
        fetchStats(); // Refresh stats after deletion
        // If we're on the last page and it becomes empty, go to previous page
        if (reviews.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchAllReviews(); // Refresh the current page
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete review");
      console.error("Error deleting review:", error);
    }
  };

  // Toggle review visibility
  const handleToggleVisibility = async (reviewId: string, visible: boolean) => {
    try {
      const response = await updateReviewVisibility(reviewId, visible);
      if (response.success) {
        setReviews((prev) =>
          prev.map((review) =>
            review._id === reviewId ? { ...review, visible } : review
          )
        );
        // Update the selected review if it's the one being modified
        if (selectedReview && selectedReview._id === reviewId) {
          setSelectedReview((prev) => (prev ? { ...prev, visible } : null));
        }
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Failed to update review visibility"
      );
      console.error("Error updating visibility:", error);
    }
  };

  // Flag/unflag a review
  const handleFlagReview = async (reviewId: string, flagged: boolean) => {
    try {
      const response = await flagReview(reviewId, flagged);
      if (response.success) {
        setReviews((prev) =>
          prev.map((review) =>
            review._id === reviewId ? { ...review, flagged } : review
          )
        );
        // Update the selected review if it's the one being modified
        if (selectedReview && selectedReview._id === reviewId) {
          setSelectedReview((prev) => (prev ? { ...prev, flagged } : null));
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to flag review");
      console.error("Error flagging review:", error);
    }
  };

  useEffect(() => {
    fetchAllReviews();
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    ratingFilter,
    statusFilter,
    dateRange,
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  const ReviewModal = () => {
    if (!selectedReview) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Review Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {selectedReview.user.avatar && (
                  <img
                    src={selectedReview.user.avatar}
                    alt={selectedReview.name}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <h4 className="font-medium">{selectedReview.name}</h4>
                  <div className="flex items-center space-x-2">
                    {renderStars(selectedReview.rating)}
                    <span className="text-sm text-gray-500">
                      {formatDate(selectedReview.createdAt)}
                    </span>
                    {selectedReview.verified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {selectedReview.title && (
                <div>
                  <h5 className="font-medium mb-2">Title</h5>
                  <p className="text-gray-700">{selectedReview.title}</p>
                </div>
              )}

              <div>
                <h5 className="font-medium mb-2">Comment</h5>
                <p className="text-gray-700 leading-relaxed">
                  {selectedReview.comment}
                </p>
              </div>

              <div>
                <h5 className="font-medium mb-2">Product</h5>
                <div className="flex items-center space-x-3">
                  {selectedReview.product?.images?.[0] && (
                    <img
                      src={selectedReview.product.images[0]}
                      alt="Product"
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <span className="text-gray-700">
                    {selectedReview.product?.name || "Unknown Product"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">
                  {selectedReview.helpful} people found this helpful
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      handleFlagReview(
                        selectedReview._id,
                        !selectedReview.flagged
                      )
                    }
                    className={`px-3 py-1 rounded hover:opacity-80 ${
                      selectedReview.flagged
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    <Flag className="w-4 h-4 inline mr-1" />
                    {selectedReview.flagged ? "Unflag" : "Flag"}
                  </button>
                  <button
                    onClick={() =>
                      handleToggleVisibility(
                        selectedReview._id,
                        !selectedReview.visible
                      )
                    }
                    className={`px-3 py-1 rounded hover:opacity-80 ${
                      selectedReview.visible
                        ? "bg-gray-100 text-gray-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {selectedReview.visible ? (
                      <>
                        <EyeOff className="w-4 h-4 inline mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 inline mr-1" />
                        Show
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteReview(selectedReview._id);
                      setShowModal(false);
                    }}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleView = (review: Review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const handleEdit = (review: Review) => {
    // You can implement edit functionality here
    console.log("Edit review:", review);
  };

  const handleDelete = (review: Review) => {
    handleDeleteReview(review._id);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Reviews Management
          </h1>
          <p className="text-gray-600">Manage and moderate customer reviews</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
              <button
                onClick={() => setError("")}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalReviews || 0}
            </div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-900 mr-2">
                {stats.averageRating || 0}
              </div>
              {renderStars(Math.round(stats.averageRating || 0))}
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          {Object.entries(stats.ratingBreakdown)
            .reverse()
            .map(([rating, count]) => (
              <div
                key={rating}
                className="bg-white p-6 rounded-lg shadow-sm border"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg font-semibold mr-1">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {count || 0}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by product or reviewer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={ratingFilter}
              onChange={(e) =>
                setRatingFilter(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
              <option value="flagged">Flagged</option>
            </select>

            <div className="flex space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Reviews Table using the Table component */}
        <Table
          title="Customer Reviews"
          columns={columns}
          data={reviews}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            pages: pagination.pages,
          }}
          onPageChange={(page) => setCurrentPage(page)}
          searchable={false} // We're handling search separately
          filterable={false} // We're handling filters separately
        />
      </div>

      {/* Review Detail Modal */}
      {showModal && <ReviewModal />}
    </div>
  );
};

export default AdminReviewsManagement;
