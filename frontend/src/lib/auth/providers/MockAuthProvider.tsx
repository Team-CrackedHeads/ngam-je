"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { AuthContextType, AuthUser, LoginCredentials } from "@/lib/auth/types";
import { AuthContext_Internal } from "@/lib/auth/AuthContext";

interface MockAuthProviderProps {
  children: ReactNode;
  /**
   * Initial mock user - useful for testing specific scenarios
   * If not provided, loads from localStorage or defaults to visitor
   */
  initialUser?: AuthUser | null;
}

/**
 * Mock Authentication Provider
 *
 * This provider simulates authentication for development.
 * It stores auth state in localStorage and provides role switching.
 *
 * DROP-IN REPLACEMENT: When ready for real auth, simply swap this provider
 * with SupabaseAuthProvider, ClerkAuthProvider, etc. - no changes to app code needed!
 */
export function MockAuthProvider({ children, initialUser }: MockAuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("mock_auth_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (initialUser) {
      setUser(initialUser);
      localStorage.setItem("mock_auth_user", JSON.stringify(initialUser));
    } else {
      // Default visitor user
      const defaultUser: AuthUser = {
        id: "visitor_" + Math.random().toString(36).substr(2, 9),
        username: "Guest User",
        email: "guest@example.com",
        isAuthenticated: false,
      };
      setUser(defaultUser);
      localStorage.setItem("mock_auth_user", JSON.stringify(defaultUser));
    }
    setIsLoading(false);
  }, [initialUser]);

  // Sync user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("mock_auth_user", JSON.stringify(user));
    }
  }, [user]);

  const login = async (credentials: LoginCredentials) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUser: AuthUser = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      username: credentials.username || credentials.email?.split("@")[0] || "User",
      email: credentials.email,
      isAuthenticated: true,
    };

    setUser(mockUser);
  };

  const logout = async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const guestUser: AuthUser = {
      id: "visitor_" + Math.random().toString(36).substr(2, 9),
      username: "Guest User",
      email: "guest@example.com",
      isAuthenticated: false,
    };

    setUser(guestUser);
  };

  /**
   * Check if current user owns a resource
   * For mock: we check localStorage for owned resources
   * For real auth: this would query the database
   */
  const checkIsOwner = (resourceId: string): boolean => {
    if (!user?.isAuthenticated) return false;

    // Check localStorage for mock ownership data
    const ownedResources = localStorage.getItem("mock_owned_resources");
    if (ownedResources) {
      const owned = JSON.parse(ownedResources);
      return owned[resourceId] === user.id;
    }

    return false;
  };

  /**
   * Dev-only: Quick role switching for testing different views
   * This method won't exist in production auth providers
   */
  const setMockRole = (role: 'poster' | 'visitor' | 'moderator') => {
    let mockUser: AuthUser;

    switch (role) {
      case 'poster':
        mockUser = {
          id: "poster_123",
          username: "Poster User",
          email: "poster@example.com",
          isAuthenticated: true,
        };
        // Mark current listing as owned by this user
        const currentListingId = window.location.pathname.split('/').pop();
        if (currentListingId) {
          const owned = JSON.parse(localStorage.getItem("mock_owned_resources") || "{}");
          owned[currentListingId] = mockUser.id;
          localStorage.setItem("mock_owned_resources", JSON.stringify(owned));
        }
        break;

      case 'moderator':
        mockUser = {
          id: "mod_456",
          username: "Moderator",
          email: "mod@example.com",
          isAuthenticated: true,
        };
        break;

      case 'visitor':
      default:
        mockUser = {
          id: "visitor_789",
          username: "Guest User",
          email: "guest@example.com",
          isAuthenticated: false,
        };
        break;
    }

    setUser(mockUser);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user?.isAuthenticated || false,
    login,
    logout,
    checkIsOwner,
    setMockRole,
  };

  return (
    <AuthContext_Internal.Provider value={value}>
      {children}
    </AuthContext_Internal.Provider>
  );
}
