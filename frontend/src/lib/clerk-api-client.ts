/**
 * API Client for FastAPI Backend with Clerk Authentication
 * Handles authenticated requests using Clerk JWT tokens
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiError {
  detail: string;
  status: number;
}

/**
 * Create an API client instance with Clerk token
 * Usage: const client = createClerkApiClient(await getToken());
 */
export function createClerkApiClient(token: string | null) {
  // Create Axios instance with base configuration
  const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 second timeout
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - adds auth token to all requests
  axiosInstance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handles errors globally
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ detail?: string; message?: string }>) => {
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        const apiError: ApiError = {
          detail: errorData?.detail || errorData?.message || 'An error occurred',
          status: error.response.status,
        };
        return Promise.reject(apiError);
      } else if (error.request) {
        // Request made but no response received
        const apiError: ApiError = {
          detail: 'Network error. Please check your connection.',
          status: 0,
        };
        return Promise.reject(apiError);
      } else {
        // Something else happened
        const apiError: ApiError = {
          detail: error.message || 'An error occurred',
          status: 0,
        };
        return Promise.reject(apiError);
      }
    }
  );

  return {
    /**
     * GET request
     */
    get: async <T>(endpoint: string): Promise<T> => {
      const response = await axiosInstance.get<T>(endpoint);
      return response.data;
    },

    /**
     * POST request
     */
    post: async <T>(endpoint: string, data?: unknown): Promise<T> => {
      const response = await axiosInstance.post<T>(endpoint, data);
      return response.data;
    },

    /**
     * PUT request
     */
    put: async <T>(endpoint: string, data?: unknown): Promise<T> => {
      const response = await axiosInstance.put<T>(endpoint, data);
      return response.data;
    },

    /**
     * PATCH request
     */
    patch: async <T>(endpoint: string, data?: unknown): Promise<T> => {
      const response = await axiosInstance.patch<T>(endpoint, data);
      return response.data;
    },

    /**
     * DELETE request
     */
    delete: async <T>(endpoint: string): Promise<T> => {
      const response = await axiosInstance.delete<T>(endpoint);
      return response.data;
    },

    /**
     * Access to raw Axios instance for advanced usage
     */
    instance: axiosInstance,
  };
}

/**
 * Hook to use Clerk API client in React components
 *
 * Example usage:
 * ```tsx
 * import { useClerkApiClient } from '@/lib/clerk-api-client';
 *
 * function MyComponent() {
 *   const apiClient = useClerkApiClient();
 *
 *   const fetchData = async () => {
 *     const client = await apiClient();
 *     const data = await client.get('/api/v1/data');
 *   };
 * }
 * ```
 */
export function useClerkApiClient() {
  // Dynamic import to avoid issues with SSR
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAuth } = require('@clerk/nextjs');
  const { getToken } = useAuth();

  return async () => {
    const token = await getToken();
    return createClerkApiClient(token);
  };
}
