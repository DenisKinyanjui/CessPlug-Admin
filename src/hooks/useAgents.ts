// // hooks/useAgents.ts
// import { useState, useEffect, useCallback } from 'react';
// import * as adminApi from '../services/adminApi';
// import { 
//   Agent, 
//   CreateAgentData, 
//   UpdateAgentData, 
//   AgentFilters,
//   AgentsResponse 
// } from '../types/Agent';

// interface UseAgentsState {
//   agents: Agent[];
//   loading: boolean;
//   error: string | null;
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     pages: number;
//   };
// }

// interface UseAgentsReturn extends UseAgentsState {
//   filters: AgentFilters;
//   fetchAgents: (searchFilters?: AgentFilters) => Promise<void>;
//   createAgent: (data: CreateAgentData) => Promise<boolean>;
//   updateAgent: (id: string, data: UpdateAgentData) => Promise<boolean>;
//   deleteAgent: (id: string) => Promise<boolean>;
//   getAgentById: (id: string) => Promise<Agent | null>;
//   updateFilters: (newFilters: Partial<AgentFilters>) => void;
//   clearError: () => void;
//   refetch: () => Promise<void>;
//   setPage: (page: number) => void;
//   setLimit: (limit: number) => void;
// }

// export const useAgents = (initialFilters?: AgentFilters): UseAgentsReturn => {
//   const [state, setState] = useState<UseAgentsState>({
//     agents: [],
//     loading: false,
//     error: null,
//     pagination: {
//       page: 1,
//       limit: 10,
//       total: 0,
//       pages: 0
//     }
//   });

//   const [filters, setFilters] = useState<AgentFilters>({
//     page: 1,
//     limit: 10,
//     search: '',
//     isActive: '',
//     agentActive: '',
//     ...initialFilters
//   });

//   // Fetch agents
//   const fetchAgents = useCallback(async (searchFilters?: AgentFilters) => {
//     setState(prev => ({ ...prev, loading: true, error: null }));
    
//     try {
//       const filtersToUse = searchFilters || filters;
//       const response: AgentsResponse = await adminApi.getAllAgents(filtersToUse);
      
//       setState(prev => ({
//         ...prev,
//         agents: response.data.agents,
//         pagination: response.data.pagination,
//         loading: false
//       }));
//     } catch (error: any) {
//       setState(prev => ({
//         ...prev,
//         error: error.response?.data?.message || 'Failed to fetch agents',
//         loading: false,
//         agents: []
//       }));
//     }
//   }, [filters]);

//   // Create agent
//   const createAgent = useCallback(async (data: CreateAgentData): Promise<boolean> => {
//     setState(prev => ({ ...prev, loading: true, error: null }));
    
//     try {
//       await adminApi.createAgent(data);
//       setState(prev => ({ ...prev, loading: false }));
      
//       // Refresh the agents list
//       await fetchAgents();
//       return true;
//     } catch (error: any) {
//       setState(prev => ({
//         ...prev,
//         error: error.response?.data?.message || 'Failed to create agent',
//         loading: false
//       }));
//       return false;
//     }
//   }, [fetchAgents]);

//   // Update agent
//   const updateAgent = useCallback(async (id: string, data: UpdateAgentData): Promise<boolean> => {
//     setState(prev => ({ ...prev, loading: true, error: null }));
    
//     try {
//       await adminApi.updateAgent(id, data);
//       setState(prev => ({ ...prev, loading: false }));
      
//       // Refresh the agents list
//       await fetchAgents();
//       return true;
//     } catch (error: any) {
//       setState(prev => ({
//         ...prev,
//         error: error.response?.data?.message || 'Failed to update agent',
//         loading: false
//       }));
//       return false;
//     }
//   }, [fetchAgents]);

//   // Delete agent
//   const deleteAgent = useCallback(async (id: string): Promise<boolean> => {
//     setState(prev => ({ ...prev, loading: true, error: null }));
    
//     try {
//       await adminApi.deleteAgent(id);
//       setState(prev => ({ ...prev, loading: false }));
      
//       // Refresh the agents list
//       await fetchAgents();
//       return true;
//     } catch (error: any) {
//       setState(prev => ({
//         ...prev,
//         error: error.response?.data?.message || 'Failed to delete agent',
//         loading: false
//       }));
//       return false;
//     }
//   }, [fetchAgents]);

//   // Get agent by ID
//   const getAgentById = useCallback(async (id: string): Promise<Agent | null> => {
//     try {
//       const response = await adminApi.getAgentById(id);
//       return response.data.agent;
//     } catch (error: any) {
//       setState(prev => ({
//         ...prev,
//         error: error.response?.data?.message || 'Failed to fetch agent details'
//       }));
//       return null;
//     }
//   }, []);

//   // Update filters and fetch new data
//   const updateFilters = useCallback((newFilters: Partial<AgentFilters>) => {
//     const updatedFilters = { 
//       ...filters, 
//       ...newFilters,
//       // Reset to first page when filters change (unless page is specifically set)
//       page: newFilters.page !== undefined ? newFilters.page : 1
//     };
//     setFilters(updatedFilters);
//     fetchAgents(updatedFilters);
//   }, [filters, fetchAgents]);

//   // Set specific page
//   const setPage = useCallback((page: number) => {
//     const updatedFilters = { ...filters, page };
//     setFilters(updatedFilters);
//     fetchAgents(updatedFilters);
//   }, [filters, fetchAgents]);

//   // Set items per page
//   const setLimit = useCallback((limit: number) => {
//     const updatedFilters = { ...filters, limit, page: 1 }; // Reset to first page
//     setFilters(updatedFilters);
//     fetchAgents(updatedFilters);
//   }, [filters, fetchAgents]);

//   // Clear error
//   const clearError = useCallback(() => {
//     setState(prev => ({ ...prev, error: null }));
//   }, []);

//   // Refetch with current filters
//   const refetch = useCallback(async () => {
//     await fetchAgents();
//   }, [fetchAgents]);

//   // Load initial data when component mounts or filters change initially
//   useEffect(() => {
//     fetchAgents();
//   }, []); // Only run on mount

//   return {
//     ...state,
//     filters,
//     fetchAgents,
//     createAgent,
//     updateAgent,
//     deleteAgent,
//     getAgentById,
//     updateFilters,
//     clearError,
//     refetch,
//     setPage,
//     setLimit
//   };
// };

// // Additional utility hook for agent departments and permissions
// export const useAgentConstants = () => {
//   const departments = [
//     { value: 'Delivery', label: 'Delivery' },
//     { value: 'Sales', label: 'Sales' },
//     { value: 'Customer Service', label: 'Customer Service' },
//     { value: 'General', label: 'General' }
//   ];

//   const permissions = [
//     { key: 'view_orders', label: 'View Orders' },
//     { key: 'create_orders', label: 'Create Orders' },
//     { key: 'update_orders', label: 'Update Orders' },
//     { key: 'view_customers', label: 'View Customers' },
//     { key: 'create_customers', label: 'Create Customers' },
//     { key: 'manage_pickups', label: 'Manage Pickups' }
//   ];

//   const statusOptions = [
//     { value: '', label: 'All Status' },
//     { value: 'true', label: 'Active' },
//     { value: 'false', label: 'Inactive' }
//   ];

//   const agentStatusOptions = [
//     { value: '', label: 'Agent Status' },
//     { value: 'true', label: 'Agent Active' },
//     { value: 'false', label: 'Agent Inactive' }
//   ];

//   return {
//     departments,
//     permissions,
//     statusOptions,
//     agentStatusOptions
//   };
// };

// export default useAgents;