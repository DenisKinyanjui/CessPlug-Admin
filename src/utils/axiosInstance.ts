import axios, {
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosRequestConfig,
  AxiosRequestHeaders,
} from 'axios';

// ✅ Type augmentation to allow 'isAdmin' in axios config
declare module 'axios' {
  export interface AxiosRequestConfig {
    isAdmin?: boolean;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : 'http://localhost:5000/api';

// ✅ Create the axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const tokenKey = config.isAdmin ? 'adminToken' : 'token';
    const token = localStorage.getItem(tokenKey);

    if (token) {
      (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ✅ Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const config = error.config as AxiosRequestConfig;
      const tokenKey = config.isAdmin ? 'adminToken' : 'token';
      const userKey = config.isAdmin ? 'adminUser' : 'user';

      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
