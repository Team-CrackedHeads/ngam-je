"use client";

import React, { createContext, useContext } from "react";
import { AuthContextType } from "./types";

/**
 * Auth Context - the interface that components consume
 * This NEVER changes regardless of which auth provider is used
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook for components to access auth state and methods
 * Usage: const { user, isAuthenticated, checkIsOwner } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Base provider that wraps the actual implementation
 * This allows us to swap implementations without changing consumer code
 */
export const AuthContext_Internal = AuthContext;
