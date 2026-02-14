import axiosInstance from '../utils/axiosInstance';

// Chama types
interface ChamaGroup {
  _id: string;
  name: string;
  description: string;
  weeklyContribution: number;
  totalWeeks: number;
  currentWeek: number;
  members: any[];
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChamaContribution {
  _id: string;
  chamaGroupId: string;
  userId: string;
  week: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  transactionReference?: string;
  createdAt: string;
}

export interface ChamaRedemption {
  _id: string;
  chamaGroupId: string;
  userId: string;
  orderId: string;
  week: number;
  amount: number;
  status: 'completed' | 'cancelled';
  createdAt: string;
}

// Get all chamas
export const getAllChamas = async (filters?: any) => {
  try {
    const response = await axiosInstance.get('/admin/chamas', { params: filters });
    return {
      success: response.data.success,
      chamas: response.data.data || [],
      ...response.data
    };
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Get chama details
export const getChamaById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/admin/chamas/${id}`);
    return {
      success: response.data.success,
      chama: response.data.data,
      ...response.data
    };
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Create chama
export const createChama = async (data: Omit<ChamaGroup, '_id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const response = await axiosInstance.post('/admin/chamas', data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Update chama
export const updateChama = async (id: string, data: Partial<ChamaGroup>) => {
  try {
    const response = await axiosInstance.post(`/admin/chamas/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Activate chama
export const activateChama = async (id: string) => {
  try {
    const response = await axiosInstance.post(`/admin/chamas/${id}/activate`);
    return {
      success: response.data.success,
      chama: response.data.data,
      ...response.data
    };
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Pause chama
export const pauseChama = async (id: string) => {
  try {
    const response = await axiosInstance.post(`/admin/chamas/${id}/pause`);
    return {
      success: response.data.success,
      chama: response.data.data,
      ...response.data
    };
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Add member to chama
export const addMemberToChama = async (chamaId: string, userId: string, position: string) => {
  try {
    const response = await axiosInstance.post(`/admin/chamas/${chamaId}/add-member`, { userId, position });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Remove member from chama
export const removeMemberFromChama = async (chamaId: string, userId: string) => {
  try {
    const response = await axiosInstance.delete(`/admin/chamas/${chamaId}/remove-member/${userId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Get contributions for a chama
export const getChamaContributions = async (chamaId: string, filters?: any) => {
  try {
    const response = await axiosInstance.get(`/admin/chamas/${chamaId}/contributions`, { params: filters });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Mark contribution as paid
export const markContributionPaid = async (contributionId: string, transactionRef?: string) => {
  try {
    const response = await axiosInstance.post(`/admin/contributions/${contributionId}/mark-paid`, {
      transactionReference: transactionRef
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Get redemptions for a chama
export const getChamaRedemptions = async (chamaId: string, filters?: any) => {
  try {
    const response = await axiosInstance.get(`/admin/chamas/${chamaId}/redemptions`, { params: filters });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Get chama statistics
export const getChamaStats = async () => {
  try {
    const response = await axiosInstance.get('/admin/chamas/stats');
    const data = response.data.data || response.data;
    return {
      ...data,
      totalChamas: data.totalGroups,
      activeChamas: data.activeGroups
    };
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Rotate chama turn
export const nextChamaTurn = async (chamaId: string) => {
  try {
    const response = await axiosInstance.post(`/admin/chamas/${chamaId}/next-turn`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// ===== USER CHAMA MEMBERSHIP FUNCTIONS =====

// Get user's chama memberships
export const getUserChamaMemberships = async (userId: string) => {
  try {
    const response = await axiosInstance.get(`/admin/users/${userId}/chama-memberships`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Get chama members (users in a chama group)
export const getChamaMembers = async (chamaId: string) => {
  try {
    const response = await axiosInstance.get(`/admin/chamas/${chamaId}/members`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Get member's contribution history in a chama
export const getMemberContributionHistory = async (chamaId: string, userId: string) => {
  try {
    const response = await axiosInstance.get(`/admin/chamas/${chamaId}/members/${userId}/contributions`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Get member's payout history in a chama
export const getMemberPayoutHistory = async (chamaId: string, userId: string) => {
  try {
    const response = await axiosInstance.get(`/admin/chamas/${chamaId}/members/${userId}/payouts`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export default {
  getAllChamas,
  getChamaById,
  createChama,
  updateChama,
  activateChama,
  pauseChama,
  addMemberToChama,
  removeMemberFromChama,
  getChamaContributions,
  markContributionPaid,
  getChamaRedemptions,
  getChamaStats,
  nextChamaTurn
};
