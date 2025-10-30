/**
 * API Client for FastAPI Backend
 * Handles authenticated requests with JWT tokens
 */

import { tokenStorage, isTokenExpired } from './auth-token';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface ApiError {
  detail: string;
  status: number;
}

/**
 * API Client class for making authenticated requests
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get headers with authentication token
   */
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = tokenStorage.getToken();
      if (token && !isTokenExpired(token)) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(includeAuth);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error: ApiError = {
          detail: await response.text().catch(() => 'An error occurred'),
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
  }

  // ============= Authentication Endpoints =============

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      false // Don't include auth header for login
    );

    // Store tokens
    tokenStorage.setToken(response.access_token);
    if (response.refresh_token) {
      tokenStorage.setRefreshToken(response.refresh_token);
    }

    return response;
  }

  /**
   * Sign up new user
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      '/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      false
    );

    // Store tokens
    tokenStorage.setToken(response.access_token);
    if (response.refresh_token) {
      tokenStorage.setRefreshToken(response.refresh_token);
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear tokens on logout
      tokenStorage.clearTokens();
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<any> {
    return this.request('/auth/me', {
      method: 'GET',
    });
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw { detail: 'No refresh token available', status: 401 } as ApiError;
    }

    const response = await this.request<AuthResponse>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      },
      false
    );

    // Update tokens
    tokenStorage.setToken(response.access_token);
    if (response.refresh_token) {
      tokenStorage.setRefreshToken(response.refresh_token);
    }

    return response;
  }

  // ============= Generic API Methods =============

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export class for testing or multiple instances
export default ApiClient;
