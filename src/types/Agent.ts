// types/Agent.ts
export interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  pickupStation: string | {
    _id: string;
    name: string;
    address: string;
    city: string;
    state?: string;
    postalCode?: string;
    phone: string;
    email?: string;
  };
  role: 'agent';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PickupStationData {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
}

export interface CreateAgentData {
  name: string;
  email: string;
  phone: string;
  pickupStation: string;
  isActive: boolean;
}

export interface CreateAgentWithStationData {
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  pickupStationData: PickupStationData;
}

export interface UpdateAgentData {
  name?: string;
  email?: string;
  phone?: string;
  pickupStation?: string;
  isActive?: boolean;
}

export interface UpdateAgentWithStationData {
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  pickupStationData: PickupStationData;
}

export interface AgentFilters {
  page?: number;
  limit?: number;
  search?: string;
  pickupStation?: string;
  isActive?: boolean;
}

export interface AgentResponse {
  success: boolean;
  message: string;
  data: {
    agent: Agent;
    tempPassword?: string; // For new agents
  };
}

export interface AgentsResponse {
  success: boolean;
  data: {
    agents: Agent[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface AdminResponse {
  success: boolean;
  message: string;
}