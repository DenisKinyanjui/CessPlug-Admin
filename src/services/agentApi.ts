// services/agentApi.ts
import axiosInstance from '../utils/axiosInstance';
import { 
  CreateAgentData, 
  CreateAgentWithStationData,
  UpdateAgentData,
  UpdateAgentWithStationData,
  AgentResponse, 
  AgentsResponse, 
  AgentFilters,
  AdminResponse 
} from '../types/Agent';

// Get all agents
export const getAllAgents = async (filters?: AgentFilters): Promise<AgentsResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await axiosInstance.get(`/admin/agents?${params.toString()}`, { isAdmin: true });
  return response.data;
};

// Get agent by ID
export const getAgentById = async (id: string): Promise<AgentResponse> => {
  const response = await axiosInstance.get(`/admin/agents/${id}`, { isAdmin: true });
  return response.data;
};

// Create new agent (legacy - without pickup station data)
export const createAgent = async (data: CreateAgentData): Promise<AgentResponse> => {
  const response = await axiosInstance.post('/admin/agents', data, { isAdmin: true });
  return response.data;
};

// Create new agent with pickup station data
export const createAgentWithStation = async (data: CreateAgentWithStationData): Promise<AgentResponse> => {
  const response = await axiosInstance.post('/admin/agents/with-station', data, { isAdmin: true });
  return response.data;
};

// Update agent (legacy - without pickup station data)
export const updateAgent = async (id: string, data: UpdateAgentData): Promise<AgentResponse> => {
  const response = await axiosInstance.put(`/admin/agents/${id}`, data, { isAdmin: true });
  return response.data;
};

// Update agent with pickup station data
export const updateAgentWithStation = async (id: string, data: UpdateAgentWithStationData): Promise<AgentResponse> => {
  const response = await axiosInstance.put(`/admin/agents/${id}/with-station`, data, { isAdmin: true });
  return response.data;
};

// Delete agent
export const deleteAgent = async (id: string): Promise<AdminResponse> => {
  const response = await axiosInstance.delete(`/admin/agents/${id}`, { isAdmin: true });
  return response.data;
};