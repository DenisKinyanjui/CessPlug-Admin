// services/agentStatsApi.ts
import axiosInstance from '../utils/axiosInstance'; // Use your existing axios instance
import {
  AgentStatsResponse,
  AgentOrdersResponse,
  AgentAnalyticsResponse,
  AgentOrdersParams,
  AgentAnalyticsParams
} from '../types/AgentStats';

// Get agent statistics
export const getAgentStats = async (agentId: string): Promise<AgentStatsResponse> => {
  try {
    const response = await axiosInstance.get(`/admin/agents/${agentId}/stats`, {
      isAdmin: true // Use admin token
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    throw error;
  }
};

// Get agent orders with pagination and filtering
export const getAgentOrders = async (
  agentId: string, 
  params: AgentOrdersParams = {}
): Promise<AgentOrdersResponse> => {
  try {
    const { page = 1, limit = 10, status } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });

    const response = await axiosInstance.get(`/admin/agents/${agentId}/orders?${queryParams}`, {
      isAdmin: true // Use admin token
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching agent orders:', error);
    throw error;
  }
};

// Get agent analytics with date filtering
export const getAgentAnalytics = async (
  agentId: string,
  params: AgentAnalyticsParams = {}
): Promise<AgentAnalyticsResponse> => {
  try {
    const { startDate, endDate } = params;
    const queryParams = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    });

    const response = await axiosInstance.get(`/admin/agents/${agentId}/analytics?${queryParams}`, {
      isAdmin: true // Use admin token
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching agent analytics:', error);
    throw error;
  }
};

// Convenience function to get all agent data at once
export const getCompleteAgentData = async (agentId: string) => {
  try {
    const [stats, orders, analytics] = await Promise.all([
      getAgentStats(agentId),
      getAgentOrders(agentId, { limit: 10 }), // Get recent 10 orders
      getAgentAnalytics(agentId) // Get all-time analytics
    ]);

    return {
      stats: stats.data,
      orders: orders.data,
      analytics: analytics.data
    };
  } catch (error) {
    console.error('Error fetching complete agent data:', error);
    throw error;
  }
};