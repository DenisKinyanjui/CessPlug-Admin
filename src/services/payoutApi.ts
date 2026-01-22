// services/payoutApi.ts - Fixed API endpoints to match backend routes

import axiosInstance from '../utils/axiosInstance';
import {
  PayoutFilter,
  PayoutResponse,
  PayoutStatsResponse,
  PayoutSettingsResponse,
  ProcessPayoutRequest,
  BulkPayoutAction,
  PayoutAnalyticsResponse,
  PayoutSettings
} from '../types/payout';

// Get all payout requests (admin) - FIXED to match backend route
export const getAllPayouts = async (filters: PayoutFilter = {}): Promise<PayoutResponse> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  // FIXED: Match the actual backend route structure
  const response = await axiosInstance.get(`/commissions/admin/payout-requests?${params}`, {
    isAdmin: true
  });
  
  return response.data;
};

// Get payout statistics - FIXED to match backend route
export const getPayoutStats = async (): Promise<PayoutStatsResponse> => {
  // FIXED: Use the correct backend route
  const response = await axiosInstance.get(`/commissions/admin/payout-stats`, {
    isAdmin: true
  });
  
  return response.data;
};

// Get payout analytics - FIXED to match backend route
export const getPayoutAnalytics = async (
  startDate?: string, 
  endDate?: string
): Promise<PayoutAnalyticsResponse> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  // FIXED: Use the correct backend route
  const response = await axiosInstance.get(`/commissions/admin/payout-analytics?${params}`, {
    isAdmin: true
  });
  
  return response.data;
};

// Process a single payout request - FIXED to match backend route
export const processPayoutRequest = async (
  payoutId: string, 
  action: ProcessPayoutRequest
): Promise<{ success: boolean; message: string; data?: any }> => {
  // FIXED: Use the correct backend route structure
  const response = await axiosInstance.put(
    `/commissions/payout-requests/${payoutId}/process`,
    action,
    { isAdmin: true }
  );
  
  return response.data;
};

// Bulk process multiple payout requests - FIXED to match backend route
export const bulkProcessPayouts = async (
  bulkAction: BulkPayoutAction
): Promise<{ success: boolean; message: string; data?: any }> => {
  // FIXED: Use the correct backend route
  const response = await axiosInstance.put(
    `/commissions/admin/payout-requests/bulk-process`,
    bulkAction,
    { isAdmin: true }
  );
  
  return response.data;
};

// Get payout settings - NEED TO CREATE ADMIN SETTINGS CONTROLLER AND ROUTES
export const getPayoutSettings = async (): Promise<PayoutSettingsResponse> => {
  try {
    // This endpoint needs to be created in the backend
    const response = await axiosInstance.get('/admin/payout-settings', {
      isAdmin: true
    });
    return response.data;
  } catch (error: any) {
    // Return default settings if endpoint doesn't exist yet
    console.warn('Payout settings endpoint not implemented, using defaults');
    return {
      success: true,
      data: {
        minWithdrawalAmount: 100,
        maxWithdrawalAmount: 50000,
        payoutSchedule: {
          enabled: false,
          dayOfWeek: 5,
          startTime: '07:00',
          endTime: '23:59'
        },
        globalPayoutHold: false,
        processingFee: 0,
        autoApprovalThreshold: 1000,
        requireManagerApproval: false
      }
    };
  }
};

// Update payout settings - NEED TO CREATE ADMIN SETTINGS CONTROLLER AND ROUTES
export const updatePayoutSettings = async (
  settings: Partial<PayoutSettings>
): Promise<PayoutSettingsResponse> => {
  try {
    // This endpoint needs to be created in the backend
    const response = await axiosInstance.put(
      '/admin/payout-settings',
      settings,
      { isAdmin: true }
    );
    return response.data;
  } catch (error: any) {
    console.warn('Update payout settings endpoint not implemented');
    throw new Error('Payout settings update not implemented yet');
  }
};

// Set global payout hold - NEED TO CREATE ADMIN SETTINGS CONTROLLER AND ROUTES
export const setGlobalPayoutHold = async (
  isHeld: boolean,
  reason?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // This endpoint needs to be created in the backend
    const response = await axiosInstance.put(
      '/admin/payout-settings/global-hold',
      { isHeld, reason },
      { isAdmin: true }
    );
    return response.data;
  } catch (error: any) {
    console.warn('Global payout hold endpoint not implemented');
    throw new Error('Global payout hold not implemented yet');
  }
};

// Set agent-specific payout hold - NEED TO CREATE ADMIN SETTINGS CONTROLLER AND ROUTES
export const setAgentPayoutHold = async (
  agentId: string,
  isHeld: boolean,
  reason?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // This endpoint needs to be created in the backend
    const response = await axiosInstance.put(
      `/admin/payout-settings/agents/${agentId}/payout-hold`,
      { isHeld, reason },
      { isAdmin: true }
    );
    return response.data;
  } catch (error: any) {
    console.warn('Agent payout hold endpoint not implemented');
    throw new Error('Agent payout hold not implemented yet');
  }
};

// Check if payouts are currently allowed - NEED TO CREATE ADMIN SETTINGS CONTROLLER AND ROUTES
export const checkPayoutWindow = async (): Promise<{
  success: boolean;
  data: {
    isPayoutWindowOpen: boolean;
    nextPayoutWindow?: string;
    currentTime: string;
    payoutSchedule: PayoutSettings['payoutSchedule'];
    globalPayoutHold: boolean;
    holdReason?: string;
    formattedSchedule?: string;
  };
}> => {
  try {
    // This endpoint needs to be created in the backend
    const response = await axiosInstance.get('/admin/payout-settings/window-status', {
      isAdmin: true
    });
    return response.data;
  } catch (error: any) {
    // Return default window status
    console.warn('Payout window status endpoint not implemented, using defaults');
    return {
      success: true,
      data: {
        isPayoutWindowOpen: true,
        currentTime: new Date().toISOString(),
        payoutSchedule: {
          enabled: false,
          dayOfWeek: 5,
          startTime: '07:00',
          endTime: '23:59'
        },
        globalPayoutHold: false
      }
    };
  }
};

// Export payout data to CSV - FIXED to match backend route
export const exportPayoutData = async (filters: PayoutFilter = {}): Promise<Blob> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  // FIXED: Use the correct backend route
  const response = await axiosInstance.get(
    `/commissions/admin/payout-requests/export?${params}`,
    {
      isAdmin: true,
      responseType: 'blob'
    }
  );
  
  return response.data;
};

// Get payout history for a specific agent - NEED TO CREATE ADMIN SETTINGS CONTROLLER AND ROUTES
export const getAgentPayoutHistory = async (
  agentId: string,
  page: number = 1,
  limit: number = 10
): Promise<PayoutResponse> => {
  try {
    // This endpoint needs to be created in the backend
    const response = await axiosInstance.get(
      `/admin/payout-settings/agents/${agentId}/payout-history?page=${page}&limit=${limit}`,
      { isAdmin: true }
    );
    return response.data;
  } catch (error: any) {
    console.warn('Agent payout history endpoint not implemented');
    throw new Error('Agent payout history not implemented yet');
  }
};

// Send payout notification/reminder to agent - FIXED to match backend route
export const sendPayoutNotification = async (
  payoutId: string,
  type: 'approval' | 'payment' | 'rejection' | 'reminder'
): Promise<{ success: boolean; message: string }> => {
  // FIXED: Use the correct backend route
  const response = await axiosInstance.post(
    `/commissions/payout-requests/${payoutId}/notify`,
    { type },
    { isAdmin: true }
  );
  
  return response.data;
};

// Get payout request details - This route exists in backend
export const getPayoutRequestDetails = async (
  payoutId: string
): Promise<{ success: boolean; data: any }> => {
  const response = await axiosInstance.get(
    `/commissions/payout-requests/${payoutId}`,
    { isAdmin: true }
  );
  
  return response.data;
};