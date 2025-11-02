/**
 * API Client for FastAPI Backend with Clerk Authentication
 * Handles authenticated requests using Clerk JWT tokens
 */

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
  /**
   * Get headers with Clerk authentication token
   */
  const getHeaders = (includeAuth = true): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  /**
   * Generic fetch wrapper with error handling
   */
  const request = async <T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = true
  ): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = getHeaders(includeAuth);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = 'An error occurred';

        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch {
          errorMessage = await response.text().catch(() => 'An error occurred');
        }

        const error: ApiError = {
          detail: errorMessage,
          status: response.status,
        };
        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        detail: 'Network error. Please check your connection.',
        status: 0,
      } as ApiError;
    }
  };

  return {
    /**
     * GET request
     */
    get: async <T>(endpoint: string): Promise<T> => {
      return request<T>(endpoint, { method: 'GET' });
    },

    /**
     * POST request
     */
    post: async <T>(endpoint: string, data?: any): Promise<T> => {
      return request<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    /**
     * PUT request
     */
    put: async <T>(endpoint: string, data?: any): Promise<T> => {
      return request<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    /**
     * PATCH request
     */
    patch: async <T>(endpoint: string, data?: any): Promise<T> => {
      return request<T>(endpoint, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    /**
     * DELETE request
     */
    delete: async <T>(endpoint: string): Promise<T> => {
      return request<T>(endpoint, { method: 'DELETE' });
    },
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
  const { getToken } = require('@clerk/nextjs').useAuth();

  return async () => {
    const token = await getToken();
    return createClerkApiClient(token);
  };
}
