import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { AuthTokens } from '@/types';

// API Base URL - points to Django backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
});

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setAuthTokens = (tokens: AuthTokens | null) => {
  if (tokens) {
    accessToken = tokens.access;
    refreshToken = tokens.refresh;
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  } else {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

export const getAccessToken = (): string | null => {
  if (!accessToken && typeof window !== 'undefined') {
    accessToken = localStorage.getItem('access_token');
  }
  return accessToken;
};

export const getRefreshToken = (): string | null => {
  if (!refreshToken && typeof window !== 'undefined') {
    refreshToken = localStorage.getItem('refresh_token');
  }
  return refreshToken;
};

// Request interceptor - add auth token & session header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add Custom Session ID for anonymous users
    if (typeof window !== 'undefined') {
      const sessionId = localStorage.getItem('session_id');
      if (sessionId && config.headers) {
        config.headers['X-Session-ID'] = sessionId;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const saveSessionId = (id: string) => {
  if (typeof window !== 'undefined' && id) {
    localStorage.setItem('session_id', id);
  }
};

// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh = getRefreshToken();
      if (!refresh) {
        setAuthTokens(null);
        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh,
        });
        const newTokens: AuthTokens = response.data;
        setAuthTokens(newTokens);
        processQueue(null, newTokens.access);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAuthTokens(null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Utility function to handle API errors
export const getErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data) {
      if (typeof data === 'string') return data;
      if (data.detail) return data.detail;
      if (data.message) return data.message;
      if (data.error) return data.error;
      // Handle validation errors
      if (typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        if (Array.isArray(data[firstKey])) {
          return data[firstKey][0];
        }
        return data[firstKey];
      }
    }
    return error.message;
  }
  return 'An unexpected error occurred';
};
