import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, AlertCircle, RefreshCw } from "lucide-react";
import StatsCards from "../../components/admin/StatsCards";
import { getAllOrders, getProductSalesStats } from "../../services/adminApi";
import { Order } from "../../types/Order";

interface RecentOrder {
  id: string;
  orderId: string;
  customer: string;
  amount: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
}

interface TopProduct {
  _id: string;
  name: string;
  sold: number;
  revenue: number;
  stock: number;
  image?: string;
}

const AdminDashboard: React.FC = () => {
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch recent orders
      const ordersResponse = await getAllOrders(1, 5);
      if (ordersResponse.success && ordersResponse.data.orders) {
        setRecentOrders(
          ordersResponse.data.orders.map((order: Order) => ({
            id: order._id,
            orderId: `#${order._id.slice(-6).toUpperCase()}`,
            customer: order.user?.name || "Unknown Customer",
            amount: `Ksh ${order.totalPrice.toLocaleString()}`,
            status: order.status,
          }))
        );
      }

      // Fetch top products with actual sales data
      const salesResponse = await getProductSalesStats({ limit: 5 });
      if (salesResponse.success && salesResponse.data.products) {
        setTopProducts(
          salesResponse.data.products.map((product: any) => ({
            _id: product._id,
            name: product.name,
            sold: product.totalSold,
            revenue: product.totalRevenue,
            stock: product.stock,
            image: product.images?.[0],
          }))
        );
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading && !refreshing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        </div>

        <StatsCards loading={true} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="text-red-600 hover:text-red-800 text-sm font-medium ml-4"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent orders found</p>
                <Link
                  to="/admin/orders"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block"
                >
                  View all orders →
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            <Link to={`/admin/orders/${order.id}`}>
                              {order.orderId}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.customer}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                                order.status
                              )}`}
                            >
                              {formatStatus(order.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <Link
                    to="/admin/orders"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View all orders →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Top Products
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Best selling products (last 30 days)
              </p>
            </div>

            {topProducts.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No products found</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {topProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between overflow-hidden"
                  >
                    <div className="flex items-center space-x-3">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                          {product.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {product.sold.toLocaleString()} sold
                          </p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-500">
                            Stock: {product.stock.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 ml-4 whitespace-nowrap">
                      Ksh {product.revenue.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 border-t border-gray-200">
              <Link
                to="/admin/products"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all products →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <Link
                to="/admin/products/create"
                className="block w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
              >
                + Add New Product
              </Link>
              <Link
                to="/admin/categories/create"
                className="block w-full bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
              >
                + Add New Category
              </Link>
              <Link
                to="/admin/flash-deals/create"
                className="block w-full bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
              >
                + Create Flash Deal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;