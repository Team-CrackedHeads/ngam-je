"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient, LoginCredentials, SignupData, ApiError } from '@/lib/api-client';
import { tokenStorage } from '@/lib/auth-token';

export interface User {
  id: string;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Fetch current user from API
   */
  const refreshUser = useCallback(async () => {
    if (!tokenStorage.isAuthenticated()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      // If token is invalid, clear it
      tokenStorage.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check auth status on mount
   */
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  /**
   * Login user
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.login(credentials);
      setUser(response.user || null);

      // Fetch full user data if not included in response
      if (!response.user) {
        await refreshUser();
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  /**
   * Sign up new user
   */
  const signup = useCallback(async (data: SignupData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.signup(data);
      setUser(response.user || null);

      // Fetch full user data if not included in response
      if (!response.user) {
        await refreshUser();
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || 'Signup failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshUser,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
