/**
 * Core auth types - these define the contract that ANY auth provider must follow
 * Whether using mock auth, Supabase, Clerk, NextAuth, etc. - they all implement this interface
 */

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  isAuthenticated: boolean;
}

export interface ResourceOwnership {
  listingId?: string;
  threadId?: string;
  commentId?: string;
}

export interface AuthContextType {
  // Current user state
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Auth actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;

  // Permission checks
  checkIsOwner: (resourceId: string, resourceType?: 'listing' | 'thread' | 'comment') => boolean;

  // Dev-only: Mock role switching (ignored in production auth providers)
  setMockRole?: (role: 'poster' | 'visitor' | 'moderator') => void;
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password?: string;
  // Extensible for OAuth, magic links, etc.
  provider?: 'email' | 'google' | 'github';
  token?: string;
}

export type AuthProviderType = 'mock' | 'supabase' | 'nextauth' | 'clerk' | 'custom';
