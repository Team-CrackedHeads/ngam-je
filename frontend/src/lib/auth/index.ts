/**
 * Auth system entry point
 * Export everything needed by the application
 */

// Core types
export type { AuthUser, AuthContextType, LoginCredentials, ResourceOwnership } from "./types";

// Hook for components
export { useAuth } from "./AuthContext";

// Providers - swap these based on environment or config
export { MockAuthProvider } from "./providers/MockAuthProvider";

// Future providers will be exported here:
// export { SupabaseAuthProvider } from "./providers/SupabaseAuthProvider";
// export { ClerkAuthProvider } from "./providers/ClerkAuthProvider";
// export { NextAuthProvider } from "./providers/NextAuthProvider";
