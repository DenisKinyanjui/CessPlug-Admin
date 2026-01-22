// hooks/useAgentStats.ts
import { useState, useEffect } from 'react';
import { 
  AgentStatsResponse, 
  AgentOrdersResponse, 
  AgentOrdersParams 
} from '../types/AgentStats';
import { getAgentStats, getAgentOrders } from '../services/agentStatsApi';

interface UseAgentStatsReturn {
  stats: AgentStatsResponse['data'] | null;
  orders: AgentOrdersResponse['data'] | null;
  loading: boolean;
  error: string | null;
  refetchStats: () => Promise<void>;
  refetchOrders: (params?: AgentOrdersParams) => Promise<void>;
}

export const useAgentStats = (agentId: string): UseAgentStatsReturn => {
  const [stats, setStats] = useState<AgentStatsResponse['data'] | null>(null);
  const [orders, setOrders] = useState<AgentOrdersResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await getAgentStats(agentId);
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching agent stats:', err);
      setError(err.response?.data?.message || 'Failed to fetch agent statistics');
    }
  };

  const fetchOrders = async (params: AgentOrdersParams = {}) => {
    try {
      setError(null);
      const response = await getAgentOrders(agentId, params);
      setOrders(response.data);
    } catch (err: any) {
      console.error('Error fetching agent orders:', err);
      setError(err.response?.data?.message || 'Failed to fetch agent orders');
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchOrders({ limit: 10 }) // Get recent 10 orders
      ]);
    } catch (err) {
      console.error('Error fetching initial agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agentId) {
      fetchInitialData();
    }
  }, [agentId]);

  const refetchStats = async () => {
    await fetchStats();
  };

  const refetchOrders = async (params?: AgentOrdersParams) => {
    await fetchOrders(params);
  };

  return {
    stats,
    orders,
    loading,
    error,
    refetchStats,
    refetchOrders
  };
};

// Separate hook for just statistics (lighter weight)
export const useAgentStatsOnly = (agentId: string) => {
  const [stats, setStats] = useState<AgentStatsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAgentStats(agentId);
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching agent stats:', err);
      setError(err.response?.data?.message || 'Failed to fetch agent statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agentId) {
      fetchStats();
    }
  }, [agentId]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};