import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import Table from '../../../components/admin/Table';
import { Order } from '../../../types/Order';
import { adminGetAllOrders } from '../../../services/orderApi';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchOrders = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminGetAllOrders(page, limit);
      
      if (response.success) {
        setOrders(response.data.orders);
        if (response.data.pagination) {
          setPagination({
            page: response.data.pagination.page,
            limit: response.data.pagination.limit,
            total: response.data.pagination.total,
            pages: response.data.pagination.pages
          });
        }
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePageChange = (page: number) => {
    fetchOrders(page, pagination.limit);
  };

  const orderStats = {
    total: pagination.total,
    pending: orders.filter(order => order.status === 'pending').length,
    processing: orders.filter(order => order.status === 'processing').length,
    shipped: orders.filter(order => order.status === 'shipped').length,
    delivered: orders.filter(order => order.status === 'delivered').length,
    cancelled: orders.filter(order => order.status === 'cancelled').length
  };

  const columns = [
    {
      key: '_id',
      label: 'Order ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-blue-600 text-xs sm:text-sm">#{value.slice(-8)}</span>
      )
    },
    {
      key: 'user',
      label: 'Customer',
      sortable: true,
      render: (user: any) => (
        <div>
          <div className="font-medium text-sm sm:text-base">{user?.name || 'N/A'}</div>
          <div className="text-xs sm:text-sm text-gray-500">{user?.email || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'totalPrice',
      label: 'Total',
      sortable: true,
      render: (value: number) => (
        <span className="text-xs sm:text-sm">Ksh {value.toFixed(2)}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'delivered' ? 'bg-green-100 text-green-800' :
          value === 'shipped' ? 'bg-blue-100 text-blue-800' :
          value === 'processing' ? 'bg-yellow-100 text-yellow-800' :
          value === 'pending' ? 'bg-orange-100 text-orange-800' :
          value === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'paymentMethod',
      label: 'Payment',
      render: (value: string) => (
        <span className="capitalize text-xs sm:text-sm">{value}</span>
      )
    },
    {
      key: 'isPaid',
      label: 'Paid',
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      key: 'orderItems',
      label: 'Items',
      render: (items: any[]) => (
        <span className="text-xs sm:text-sm">{items?.length || 0} item(s)</span>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value: string) => (
        <span className="text-xs sm:text-sm">{new Date(value).toLocaleDateString()}</span>
      )
    }
  ];

  const handleView = (order: Order) => {
    navigate(`/admin/orders/${order._id}`);
  };

  const handleRefresh = () => {
    fetchOrders(pagination.page, pagination.limit);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage customer orders and fulfillment</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage customer orders and fulfillment</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div className="text-center">
            <p className="text-base sm:text-lg font-medium text-gray-900">Error Loading Orders</p>
            <p className="text-sm text-gray-600">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage customer orders and fulfillment</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <ShoppingCart className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Orders</p>
              <p className="text-lg sm:text-xl font-semibold">{orderStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Package className="h-6 sm:h-8 w-6 sm:w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Pending</p>
              <p className="text-lg sm:text-xl font-semibold">{orderStats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Package className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Processing</p>
              <p className="text-lg sm:text-xl font-semibold">{orderStats.processing}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Truck className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Shipped</p>
              <p className="text-lg sm:text-xl font-semibold">{orderStats.shipped}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <CheckCircle className="h-6 sm:h-8 w-6 sm:w-8 text-green-500 mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Delivered</p>
              <p className="text-lg sm:text-xl font-semibold">{orderStats.delivered}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error message if refresh fails */}
      {error && orders.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 text-sm sm:text-base">{error}</p>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <Table
          title="All Orders"
          columns={columns}
          data={orders}
          onView={handleView}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>

      {/* No orders message */}
      {!loading && orders.length === 0 && !error && (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No orders have been placed yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;