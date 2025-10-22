/**
 * Auth system entry point
 * Export everything needed by the application
 */

// Core types
export type { AuthUser, AuthContextType, LoginCredentials, ResourceOwnership } from "@/lib/auth/types";

// Hook for components
export { useAuth } from "@/lib/auth/AuthContext";

// Providers - swap these based on environment or config
export { MockAuthProvider } from "@/lib/auth/providers/MockAuthProvider";

// Future providers will be exported here:
// export { SupabaseAuthProvider } from "@/lib/auth/providers/SupabaseAuthProvider";
// export { ClerkAuthProvider } from "@/lib/auth/providers/ClerkAuthProvider";
// export { NextAuthProvider } from "@/lib/auth/providers/NextAuthProvider";
