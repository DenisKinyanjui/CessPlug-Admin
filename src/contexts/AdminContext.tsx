import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { User, LoginCredentials } from '../types/User';
import { DashboardData } from '../types/Admin';
import * as adminApi from '../services/adminApi';

interface AdminState {
  adminUser: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: string | null;
  dashboardData: DashboardData | null;
  dashboardLoading: boolean;
}

type AdminAction =
  | { type: 'ADMIN_AUTH_START' }
  | { type: 'ADMIN_AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'ADMIN_AUTH_FAILURE'; payload: string }
  | { type: 'ADMIN_LOGOUT' }
  | { type: 'DASHBOARD_LOADING_START' }
  | { type: 'DASHBOARD_LOADING_SUCCESS'; payload: DashboardData }
  | { type: 'DASHBOARD_LOADING_FAILURE'; payload: string }
  | { type: 'CLEAR_ERROR' };

const initialState: AdminState = {
  adminUser: null,
  token: null,
  loading: false,
  isAuthenticated: false,
  isAdmin: false,
  error: null,
  dashboardData: null,
  dashboardLoading: false,
};

const adminReducer = (state: AdminState, action: AdminAction): AdminState => {
  switch (action.type) {
    case 'ADMIN_AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'ADMIN_AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        isAdmin: action.payload.user.role === 'admin',
        adminUser: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'ADMIN_AUTH_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        isAdmin: false,
        adminUser: null,
        token: null,
        error: action.payload,
      };
    case 'ADMIN_LOGOUT':
      return {
        ...state,
        adminUser: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false,
        error: null,
        dashboardData: null,
      };
    case 'DASHBOARD_LOADING_START':
      return {
        ...state,
        dashboardLoading: true,
        error: null,
      };
    case 'DASHBOARD_LOADING_SUCCESS':
      return {
        ...state,
        dashboardLoading: false,
        dashboardData: action.payload,
        error: null,
      };
    case 'DASHBOARD_LOADING_FAILURE':
      return {
        ...state,
        dashboardLoading: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

interface AdminContextType extends AdminState {
  adminLogin: (credentials: LoginCredentials) => Promise<void>;
  adminLogout: () => void;
  loadAdminUser: () => Promise<void>;
  loadDashboardData: () => Promise<void>;
  clearError: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Load admin user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role === 'admin') {
          dispatch({ type: 'ADMIN_AUTH_SUCCESS', payload: { user, token } });
        } else {
          // Clear non-admin user data
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      } catch (error) {
        console.error('Error parsing admin user data:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
  }, []);

  // Admin login function - memoized to prevent recreation
  const adminLogin = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'ADMIN_AUTH_START' });
      const response = await adminApi.adminLogin(credentials);
      
      const { user, token } = response.data;
      
      // Verify user is admin
      if (user.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      // Store in localStorage with admin prefix
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      dispatch({ type: 'ADMIN_AUTH_SUCCESS', payload: { user, token } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Admin login failed';
      dispatch({ type: 'ADMIN_AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  // Admin logout function - memoized to prevent recreation
  const adminLogout = useCallback((): void => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    dispatch({ type: 'ADMIN_LOGOUT' });
  }, []);

  // Load admin user profile - memoized to prevent recreation
  const loadAdminUser = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found');
      }
      
      dispatch({ type: 'ADMIN_AUTH_START' });
      const response = await adminApi.getAdminProfile();
      
      const { user } = response.data;
      
      // Verify user is still admin
      if (user.role !== 'admin') {
        throw new Error('Admin privileges revoked');
      }
      
      // Update localStorage
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      dispatch({ type: 'ADMIN_AUTH_SUCCESS', payload: { user, token } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load admin user';
      dispatch({ type: 'ADMIN_AUTH_FAILURE', payload: errorMessage });
      
      // Clear invalid token
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  }, []);

  // Load dashboard data - memoized to prevent recreation
  const loadDashboardData = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'DASHBOARD_LOADING_START' });
      const response = await adminApi.getDashboardStats();
      
      dispatch({ type: 'DASHBOARD_LOADING_SUCCESS', payload: response.data });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load dashboard data';
      dispatch({ type: 'DASHBOARD_LOADING_FAILURE', payload: errorMessage });
    }
  }, []);

  // Clear error - memoized to prevent recreation
  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: AdminContextType = {
    ...state,
    adminLogin,
    adminLogout,
    loadAdminUser,
    loadDashboardData,
    clearError,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};