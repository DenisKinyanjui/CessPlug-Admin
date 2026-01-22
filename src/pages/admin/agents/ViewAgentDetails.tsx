import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Package,
  DollarSign,
  Shield,
  ShieldOff,
  Hash,
  TrendingUp,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Agent } from "../../../types/Agent";
// import { AgentStats, AgentOrder } from "../../../types/AgentStats";
import * as agentApi from "../../../services/agentApi";
import { useAgentStats } from "../../../hooks/useAgentStats";

const ViewAgentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Use the new hook for stats and orders
  const {
    stats: agentData,
    orders: ordersData,
    loading: statsLoading,
    error: statsError,
    refetchStats,
    refetchOrders
  } = useAgentStats(id || '');

  useEffect(() => {
    if (id) {
      loadAgentDetails();
    }
  }, [id]);

  const loadAgentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load basic agent details
      const agentResponse = await agentApi.getAgentById(id!);
      setAgent(agentResponse.data.agent);
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load agent details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!agent) return;
    
    try {
      setUpdating(true);
      const updateData = {
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        isActive: !agent.isActive
      };
      
      const response = await agentApi.updateAgent(agent._id, updateData);
      setAgent(response.data.agent);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update agent status");
    } finally {
      setUpdating(false);
    }
  };

//   const handleEditAgent = () => {
//     navigate('/admin/agents', { 
//       state: { editAgent: agent } 
//     });
//   };

  const handleRefreshStats = async () => {
    await refetchStats();
    await refetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'arrived_at_station':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading agent details...</span>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error || "Agent not found"}</span>
        </div>
        <button
          onClick={() => navigate('/admin/agents')}
          className="mt-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </button>
      </div>
    );
  }

  // Use data from the hook
  const stats = agentData?.stats;
  const orders = ordersData?.orders || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/admin/agents')}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Agents
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agent Details</h1>
              <p className="text-gray-600 mt-1">View and manage agent information</p>
            </div>
          </div>
          <button
            onClick={handleRefreshStats}
            disabled={statsLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
            Refresh Stats
          </button>
        </div>
      </div>

      {/* Agent Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{agent.name}</h2>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Pickup Agent
              </span>
              <span
                className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  agent.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {agent.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="hidden md:block text-gray-600 mb-4">
              Managing deliveries and customer pickups at designated station
            </p>
          </div>
        </div>
      </div>

      {/* Details Section - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{agent.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-medium text-gray-900">{agent.phone}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Pickup Station</p>
                {typeof agent.pickupStation === 'object' && agent.pickupStation ? (
                  <div>
                    <p className="font-medium text-gray-900">{agent.pickupStation.name}</p>
                    <p className="text-sm text-gray-600">
                      {agent.pickupStation.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      {agent.pickupStation.city}
                      {agent.pickupStation.state && `, ${agent.pickupStation.state}`}
                    </p>
                    {agent.pickupStation.phone && (
                      <p className="text-sm text-gray-500 mt-1">
                        Phone: {agent.pickupStation.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="font-medium text-gray-900">
                    Station ID: {typeof agent.pickupStation === 'string' ? agent.pickupStation.slice(-8) : 'N/A'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Agent ID</p>
                <p className="font-medium text-gray-900 font-mono text-sm">{agent._id.slice(-8)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Date Added</p>
                <p className="font-medium text-gray-900">
                  {new Date(agent.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {new Date(agent.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Orders Handled</p>
                <p className="font-medium text-gray-900">
                  {statsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin inline" />
                  ) : (
                    stats?.totalOrders || 0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats?.totalOrders || 0
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats?.pendingOrders || 0
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">Awaiting delivery</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Commissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  `KSh ${stats?.pendingCommissions?.toLocaleString() || 0}`
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">Available for payout</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  `KSh ${stats?.totalEarnings?.toLocaleString() || 0}`
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">All time paid</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <p className="text-sm text-gray-600 mt-1">Orders handled by this agent</p>
            </div>
            {statsError && (
              <div className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {statsError}
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Order Number</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Customer</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Order Value</th>
              </tr>
            </thead>
            <tbody>
              {statsLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 mx-auto animate-spin text-gray-400 mb-2" />
                    <p className="text-gray-500">Loading orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No orders found for this agent</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Orders will appear here once the agent starts handling deliveries
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">{order.orderNumber}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{order.user.name}</p>
                        <p className="text-sm text-gray-500">{order.user.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">
                        KSh {order.totalPrice.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex justify-end gap-4">
        {/* <button
          onClick={handleEditAgent}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Edit className="h-4 w-4" />
          Edit Agent
        </button> */}
        
        <button
          onClick={handleStatusToggle}
          disabled={updating}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            agent.isActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          } disabled:opacity-50`}
        >
          {updating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : agent.isActive ? (
            <ShieldOff className="h-4 w-4" />
          ) : (
            <Shield className="h-4 w-4" />
          )}
          {agent.isActive ? 'Deactivate' : 'Activate'} Agent
        </button>
      </div>
    </div>
  );
};

export default ViewAgentDetails;