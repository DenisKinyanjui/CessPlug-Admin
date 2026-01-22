import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, ArrowLeft, Package, DollarSign, BarChart3, Calendar } from 'lucide-react';
import { Product } from '../../../types/Product';
import { Review } from '../../../types/Review';
import axiosInstance from '../../../utils/axiosInstance';
import { useAdmin } from '../../../contexts/AdminContext';
import { Loader2 } from 'lucide-react';
import { getProductReviews } from '../../../services/reviewApi';

interface ProductResponse {
  success: boolean;
  data: {
    product: Product;
  };
}

interface SalesData {
  month: string;
  sales: number;
}

interface ProductSalesResponse {
  success: boolean;
  data: {
    salesData: SalesData[];
    stats: {
      totalSold: number;
      revenue: number;
    };
  };
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAdmin();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [salesLoading, setSalesLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSold: 0,
    revenue: 0,
    avgRating: 0,
  });

  const fetchProductSales = async (productId: string) => {
    try {
      setSalesLoading(true);
      const response = await axiosInstance.get<ProductSalesResponse>(`/orders/product/${productId}/sales`, {
        isAdmin: true
      });

      if (response.data.success) {
        setSalesData(response.data.data.salesData);
        setStats(prev => ({
          ...prev,
          totalSold: response.data.data.stats.totalSold,
          revenue: response.data.data.stats.revenue
        }));
      }
    } catch (error: any) {
      console.error('Error fetching sales data:', error);
      await fetchSalesFromOrders(productId);
    } finally {
      setSalesLoading(false);
    }
  };

  const fetchSalesFromOrders = async (productId: string) => {
    try {
      const response = await axiosInstance.get('/orders', {
        isAdmin: true,
        params: { limit: 1000 }
      });

      if (response.data.success) {
        const orders = response.data.data.orders;
        const productSales: { [key: string]: number } = {};
        let totalSold = 0;
        let revenue = 0;

        orders.forEach((order: any) => {
          if (order.isPaid) {
            order.orderItems.forEach((item: any) => {
              if (item.product === productId) {
                const month = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short' });
                productSales[month] = (productSales[month] || 0) + item.quantity;
                totalSold += item.quantity;
                revenue += item.quantity * item.price;
              }
            });
          }
        });

        const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const chartData = monthsOrder.slice(0, 6).map(month => ({
          month,
          sales: productSales[month] || 0
        }));

        setSalesData(chartData);
        setStats(prev => ({
          ...prev,
          totalSold,
          revenue
        }));
      }
    } catch (error) {
      console.error('Error calculating sales from orders:', error);
      setSalesData([]);
      setStats(prev => ({
        ...prev,
        totalSold: 0,
        revenue: 0
      }));
    }
  };

  const fetchProductReviews = async (productId: string) => {
    try {
      setReviewsLoading(true);
      const response = await getProductReviews(productId, 1, 5);

      if (response.success) {
        setReviews(response.data.reviews);
        
        if (response.data.reviews.length > 0) {
          const avgRating = response.data.reviews.reduce((sum, review) => sum + review.rating, 0) / response.data.reviews.length;
          setStats(prev => ({
            ...prev,
            avgRating
          }));
        }
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin/login');
      return;
    }

    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        const productResponse = await axiosInstance.get<ProductResponse>(`/products/${id}`, {
          isAdmin: true
        });

        if (!productResponse.data.success || !productResponse.data.data.product) {
          throw new Error('Product not found');
        }

        const productData = productResponse.data.data.product;
        setProduct(productData);

        setStats(prev => ({
          ...prev,
          avgRating: productData.rating || 0
        }));

        if (id) {
          await Promise.all([
            fetchProductSales(id),
            fetchProductReviews(id)
          ]);
        }

      } catch (error: any) {
        console.error('Error fetching product:', error);
        setError(error.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id, isAuthenticated, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
        <span className="text-lg text-gray-600">Loading product details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col items-center justify-center p-4 sm:p-8 text-center">
          <div className="w-12 sm:w-16 h-12 sm:h-16 text-red-500 mb-3 sm:mb-4">⚠️</div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Product
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/admin/products')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col items-center justify-center p-4 sm:p-8 text-center">
          <div className="w-12 sm:w-16 h-12 sm:h-16 text-gray-500 mb-3 sm:mb-4">❓</div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">The requested product could not be found.</p>
          <button
            onClick={() => navigate('/admin/products')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
            Back
          </button>
          <div className="truncate">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{product.name}</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">Product Details</p>
          </div>
        </div>
        <Link
          to={`/admin/products/create?id=${product._id}`}
          className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <Edit className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
          Edit Product
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 sm:mb-4">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image Available
                    </div>
                  )}
                </div>
                {product.images && product.images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-1">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-12 sm:w-16 h-12 sm:h-16 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Product Information</h3>
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Price:</span>
                        <span className="text-sm sm:text-base font-semibold text-green-600">Ksh {product.price?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Category:</span>
                        <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">
                          {typeof product.category === 'object' ? product.category.name : product.category}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Brand:</span>
                        <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">
                          {typeof product.brand === 'object' ? product.brand.name : product.brand}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Stock:</span>
                        <span className={`text-xs sm:text-sm font-medium ${product.stock < 20 ? 'text-red-600' : 'text-green-600'}`}>
                          {product.stock} units
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Status:</span>
                        <span className={`inline-flex px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${
                          product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Description</h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Sales Performance</h3>
              {salesLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
            </div>
            <div className="space-y-3 sm:space-y-4">
              {salesData.length > 0 ? (
                salesData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">{data.month}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-blue-600 h-1.5 sm:h-2 rounded-full"
                          style={{ 
                            width: `${salesData.length > 0 ? (data.sales / Math.max(...salesData.map(d => d.sales))) * 100 : 0}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-medium">{data.sales}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">No sales data available</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Stats</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center">
                <Package className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500 mr-2 sm:mr-3" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Sold</p>
                  <p className="text-lg sm:text-xl font-semibold">{stats.totalSold.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-6 sm:h-8 w-6 sm:w-8 text-green-500 mr-2 sm:mr-3" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Revenue</p>
                  <p className="text-lg sm:text-xl font-semibold">Ksh {stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="flex items-center">
                <BarChart3 className="h-6 sm:h-8 w-6 sm:w-8 text-purple-500 mr-2 sm:mr-3" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Avg. Rating</p>
                  <p className="text-lg sm:text-xl font-semibold">{stats.avgRating.toFixed(1)}/5</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-6 sm:h-8 w-6 sm:w-8 text-orange-500 mr-2 sm:mr-3" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Created</p>
                  <p className="text-lg sm:text-xl font-semibold">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Reviews</h3>
              {reviewsLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
            </div>
            <div className="space-y-3 sm:space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={review._id} className={index < reviews.length - 1 ? "border-b border-gray-200 pb-2 sm:pb-3" : "pb-2 sm:pb-3"}>
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <span className="text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-none">{review.user.name}</span>
                      <span className="text-xs sm:text-sm text-yellow-500">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                    </div>
                    {review.title && (
                      <p className="text-xs sm:text-sm font-medium text-gray-800 mb-1 truncate">{review.title}</p>
                    )}
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                      {review.verified && (
                        <span className="text-[10px] sm:text-xs text-green-600 bg-green-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">
                  {reviewsLoading ? 'Loading reviews...' : 'No reviews yet'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;