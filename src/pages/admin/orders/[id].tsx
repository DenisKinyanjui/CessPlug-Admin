import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Calendar, User, CreditCard, Loader2, Clock, AlertCircle, Phone, Eye, Camera, Download } from 'lucide-react';
import { Order } from '../../../types/Order';
import { getOrderById, adminGetOrderById, adminUpdateOrderStatus } from '../../../services/orderApi';
import { useAdmin } from '../../../contexts/AdminContext';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAdmin();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showProofModal, setShowProofModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id, isAuthenticated, isAdmin]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = isAuthenticated && isAdmin
        ? await adminGetOrderById(orderId)
        : await getOrderById(orderId);
        
      setOrder(response.data.order);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('You are not authorized to view this order. Please login as admin.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch order details');
      }
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { 
      status: 'pending', 
      label: 'Order Pending', 
      icon: Clock, 
      description: 'Order has been placed and is awaiting processing',
      color: 'text-yellow-600'
    },
    { 
      status: 'processing', 
      label: 'Processing', 
      icon: Package, 
      description: 'Order is being prepared for shipment',
      color: 'text-blue-600'
    },
    { 
      status: 'shipped', 
      label: 'Shipped', 
      icon: Truck, 
      description: 'Order has been shipped and is on the way',
      color: 'text-purple-600'
    },
    { 
      status: 'delivered', 
      label: 'Delivered', 
      icon: CheckCircle, 
      description: 'Order has been successfully delivered',
      color: 'text-green-600'
    }
  ];

  const getUpdatedStatusSteps = (currentStatus: string) => {
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    return statusSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex && currentStatus !== 'cancelled',
      active: step.status === currentStatus,
      disabled: currentStatus === 'cancelled'
    }));
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order || updating || !isAdmin) return;
    
    if (order.status === 'delivered' && newStatus !== 'delivered') {
      setError('Cannot change status of a delivered order');
      return;
    }
    
    try {
      setUpdating(true);
      setError(null);
      
      await adminUpdateOrderStatus(order._id, newStatus);
      await fetchOrderDetails(order._id);
      
      setSuccessMessage(`Order status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`);
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleViewProof = (proofUrl: string) => {
    window.open(proofUrl, '_blank');
  };

  const handleDownloadProof = async (proofUrl: string, orderNumber: string) => {
    try {
      const response = await fetch(proofUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `delivery-proof-${orderNumber}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading proof:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'shipped':
        return 'text-purple-600 bg-purple-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPhoneNumber = (phone: string | undefined) => {
    if (!phone) return 'Not provided';
    
    if (phone.startsWith('+254')) {
      return phone;
    }
    
    if (phone.startsWith('254')) {
      return `+${phone}`;
    }
    
    if (phone.startsWith('0')) {
      return `+254${phone.substring(1)}`;
    }
    
    return phone;
  };

  const canUpdateStatus = (targetStatus: string) => {
    if (!order || !isAdmin) return false;
    
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    const targetIndex = statusOrder.indexOf(targetStatus);
    
    if (order.status === 'delivered' && targetStatus !== 'cancelled') return false;
    if (targetStatus !== 'cancelled' && targetIndex < currentIndex) return false;
    
    return true;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 sm:h-6 w-5 sm:w-6 animate-spin" />
          <span className="text-sm sm:text-base">{isAuthenticated ? 'Loading order details...' : 'Checking permissions...'}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
            Back to Orders
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <div className="flex">
            <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 text-red-400" />
            <div className="ml-2 sm:ml-3">
              <h3 className="text-xs sm:text-sm font-medium text-red-800">Error Loading Order</h3>
              <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-2 sm:mt-4">
                <button
                  onClick={() => id && fetchOrderDetails(id)}
                  className="bg-red-100 px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8 sm:py-12 px-4 sm:px-6">
        <p className="text-sm sm:text-base text-gray-500">Order not found</p>
      </div>
    );
  }

  const updatedStatusSteps = getUpdatedStatusSteps(order.status);

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <div className="flex">
            <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5 text-green-400" />
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
            Back to Orders
          </button>
          <div className="truncate">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Order #{order._id}</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">Order Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          {isAdmin && (
            <select
              value={order.status}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              disabled={updating}
              className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              <option value="pending" disabled={!canUpdateStatus('pending')}>
                Pending
              </option>
              <option value="processing" disabled={!canUpdateStatus('processing')}>
                Processing
              </option>
              <option value="shipped" disabled={!canUpdateStatus('shipped')}>
                Shipped
              </option>
              <option value="delivered" disabled={!canUpdateStatus('delivered')}>
                Delivered
              </option>
              <option value="cancelled" disabled={!canUpdateStatus('cancelled')}>
                Cancelled
              </option>
            </select>
          )}
          {updating && <Loader2 className="h-3 sm:h-4 w-3 sm:w-4 animate-spin" />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Enhanced Order Status with Progress */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Order Status</h3>
            
            {order.status === 'cancelled' ? (
              <div className="flex items-center justify-center p-4 sm:p-8 bg-red-50 rounded-lg">
                <div className="text-center">
                  <AlertCircle className="h-8 sm:h-12 w-8 sm:w-12 text-red-600 mx-auto mb-2 sm:mb-4" />
                  <h4 className="text-sm sm:text-lg font-medium text-red-800 mb-1 sm:mb-2">Order Cancelled</h4>
                  <p className="text-xs sm:text-sm text-red-600">This order has been cancelled</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {updatedStatusSteps.map((step, index) => (
                  <div key={step.status} className="flex items-start">
                    <div className="flex-shrink-0 relative">
                      <div className={`flex-shrink-0 w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-green-100 text-green-600' 
                          : step.active 
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                      }`}>
                        <step.icon className="h-4 sm:h-5 w-4 sm:w-5" />
                      </div>
                      {index < updatedStatusSteps.length - 1 && (
                        <div className={`absolute top-8 sm:top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-6 sm:h-8 ${
                          step.completed ? 'bg-green-300' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    <div className="ml-3 sm:ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs sm:text-sm font-medium ${
                          step.completed 
                            ? 'text-green-600' 
                            : step.active 
                              ? 'text-blue-600'
                              : 'text-gray-500'
                        }`}>
                          {step.label}
                        </p>
                        {step.active && (
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NEW: Delivery Proof Section */}
          {order.status === 'delivered' && (order as any).deliveryProofUrl && (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-green-600" />
                  Delivery Proof
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewProof((order as any).deliveryProofUrl)}
                    className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Full Size
                  </button>
                  <button
                    onClick={() => handleDownloadProof((order as any).deliveryProofUrl, order._id)}
                    className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="relative group">
                  <img
                    src={(order as any).deliveryProofUrl}
                    alt={`Delivery proof for order ${order._id}`}
                    className="w-full h-64 sm:h-80 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleViewProof((order as any).deliveryProofUrl)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all cursor-pointer flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                  <span>Proof uploaded by delivery agent</span>
                  {order.deliveredAt && (
                    <span>
                      Delivered: {formatDate(order.deliveredAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Order Items</h3>
            <div className="space-y-3 sm:space-y-4">
              {order.orderItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <img
                      src={item.image || "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400"}
                      alt={item.name}
                      className="h-12 sm:h-16 w-12 sm:w-16 rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400";
                      }}
                    />
                    <div className="truncate">
                      <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm sm:text-base font-medium text-gray-900">Ksh {item.price.toFixed(2)}</p>
                    <p className="text-xs sm:text-sm text-gray-500">each</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-lg font-semibold text-gray-900">Total</span>
                <span className="text-sm sm:text-lg font-semibold text-gray-900">Ksh {order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Customer Information</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center">
                <User className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400 mr-2 sm:mr-3" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Customer</p>
                  <p className="text-sm sm:text-base font-medium">{order.user.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{order.user.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400 mr-2 sm:mr-3" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Phone Number</p>
                  <p className="text-sm sm:text-base font-medium">{formatPhoneNumber(order.user.phone)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400 mr-2 sm:mr-3" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Order Date</p>
                  <p className="text-sm sm:text-base font-medium">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <CreditCard className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400 mr-2 sm:mr-3" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Payment Method</p>
                  <p className="text-sm sm:text-base font-medium capitalize">{order.paymentMethod}</p>
                </div>
              </div>
              {order.isPaid && order.paidAt && (
                <div className="flex items-center">
                  <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5 text-green-400 mr-2 sm:mr-3" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Paid At</p>
                    <p className="text-sm sm:text-base font-medium text-green-600">{formatDate(order.paidAt)}</p>
                  </div>
                </div>
              )}
              {order.isDelivered && order.deliveredAt && (
                <div className="flex items-center">
                  <Truck className="h-4 sm:h-5 w-4 sm:w-5 text-green-400 mr-2 sm:mr-3" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Delivered At</p>
                    <p className="text-sm sm:text-base font-medium text-green-600">{formatDate(order.deliveredAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Delivery Address</h3>
            <div className="text-xs sm:text-sm text-gray-600">
              <p className="text-sm sm:text-base font-medium text-gray-900">{order.user.name}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Tracking Information */}
          {order.trackingNumber && (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Tracking Information</h3>
              <div className="text-xs sm:text-sm text-gray-600">
                <p className="text-sm sm:text-base font-medium text-gray-900">Tracking Number</p>
                <p className="mt-1 font-mono text-blue-600 truncate">{order.trackingNumber}</p>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Order Summary</h3>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span>Items Price</span>
                <span>Ksh {order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Ksh {order.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>Ksh {order.taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1.5 sm:pt-2 border-t border-gray-200 font-medium">
                <span>Total</span>
                <span>Ksh {order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Payment Status</h3>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Status</span>
                <span className={`px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${
                  order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {order.isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              {order.paymentResult && (
                <div className="text-xs sm:text-sm text-gray-600">
                  <p>Payment ID: <span className="font-mono truncate">{order.paymentResult.id}</span></p>
                  <p>Status: <span className="capitalize">{order.paymentResult.status}</span></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;