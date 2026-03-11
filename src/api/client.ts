/**
 * Axios Client
 * Configured axios instance with interceptors
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config';
import { getAccessToken, getRefreshToken, saveTokens, removeTokens } from '../utils/storage';
import { ApiError, ApiErrorResponse } from '../types';
import { ENDPOINTS } from './endpoints';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Flag to prevent multiple refresh token requests
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

/**
 * Request Interceptor
 * Adds authorization token to requests
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get access token from storage
    const token = await getAccessToken();

    // Add token to headers if available
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles errors and token refresh
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return data directly from success response
    return response.data;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Skip token refresh for auth endpoints (login, signup, etc.)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                          originalRequest.url?.includes('/auth/signup') ||
                          originalRequest.url?.includes('/auth/firebase') ||
                          originalRequest.url?.includes('/auth/forgot-password') ||
                          originalRequest.url?.includes('/auth/reset-password');

    // Handle 401 Unauthorized - Token expired (but not for auth endpoints)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get refresh token
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          // No refresh token, logout user
          await removeTokens();
          processQueue(new ApiError('Session expired', 401), null);
          return Promise.reject(new ApiError('Session expired', 401));
        }

        // Request new tokens
        const response = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
          `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Save new tokens
        await saveTokens({ accessToken, refreshToken: newRefreshToken });

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        await removeTokens();
        processQueue(refreshError, null);
        return Promise.reject(new ApiError('Session expired', 401));
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Log for debugging
      console.log('API Error Response:', {
        status: error.response.status,
        data: errorData,
        headers: error.response.headers
      });
      
      // Handle rate limit (429) - response might be HTML
      if (error.response.status === 429) {
        throw new ApiError(
          'Too many requests. Please try again later.',
          429
        );
      }
      
      // Handle JSON error responses
      if (errorData.error?.message) {
        throw new ApiError(
          errorData.error.message,
          error.response.status,
          errorData.error?.errors
        );
      }
      
      // Fallback for non-standard responses
      throw new ApiError(
        'An error occurred',
        error.response.status
      );
    }

    // Network error or no response
    throw new ApiError(
      error.message || 'Network error',
      0
    );
  }
);

export default apiClient;
