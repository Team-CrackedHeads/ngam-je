# Drop-in Auth System

This auth system is designed to be **completely replaceable** without changing any application code.

## Quick Start

### Using Auth in Components

```tsx
import { useAuth } from "@/lib/auth";

function MyComponent() {
  const { user, isAuthenticated, checkIsOwner } = useAuth();

  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }

  const isOwner = checkIsOwner("listing_123");

  return (
    <div>
      <p>Welcome, {user.username}!</p>
      {isOwner && <button>Edit Listing</button>}
    </div>
  );
}
```

### Using Auth in FAQ Page

```tsx
import { useAuth } from "@/lib/auth";

function FAQPage() {
  const { user, checkIsOwner } = useAuth();
  const listingId = "current_listing_id"; // Get from URL params

  const isPoster = checkIsOwner(listingId, 'listing');

  return (
    <div>
      {isPoster ? (
        <div>Poster View: Moderate questions, see analytics</div>
      ) : (
        <div>Visitor View: Ask questions, see answers</div>
      )}
    </div>
  );
}
```

## Current Setup: Mock Auth

Currently using `MockAuthProvider` for development:
- Stores user in localStorage
- Provides role switching via `AuthRoleToggle` component (bottom-right in dev mode)
- No backend required

### Dev Role Switching

In development, you'll see a role toggle in the bottom-right:
- **Poster**: Owner of listings, can edit/moderate
- **Visitor**: Guest user, can browse and ask questions
- **Moderator**: Community moderator with elevated permissions

## Replacing with Real Auth

When ready for production, simply swap the provider in `layout.tsx`:

### Option 1: Supabase

```tsx
// src/lib/auth/providers/SupabaseAuthProvider.tsx
import { createClient } from '@supabase/supabase-js';

export function SupabaseAuthProvider({ children }) {
  const supabase = createClient(url, key);

  // Implement same AuthContextType interface
  const value: AuthContextType = {
    user: /* map from supabase.auth.user() */,
    isLoading,
    isAuthenticated,
    login: async (creds) => { /* supabase.auth.signIn() */ },
    logout: async () => { /* supabase.auth.signOut() */ },
    checkIsOwner: (id) => { /* query database */ },
  };

  return <AuthContext_Internal.Provider value={value}>{children}</AuthContext_Internal.Provider>;
}
```

Then in `layout.tsx`:
```tsx
- import { MockAuthProvider } from "@/lib/auth";
+ import { SupabaseAuthProvider } from "@/lib/auth";

- <MockAuthProvider>
+ <SupabaseAuthProvider>
```

### Option 2: Clerk

```tsx
import { ClerkProvider, useUser } from "@clerk/nextjs";

export function ClerkAuthProvider({ children }) {
  const { user: clerkUser, isLoaded } = useUser();

  // Map Clerk user to our AuthUser interface
  const value: AuthContextType = {
    user: clerkUser ? {
      id: clerkUser.id,
      username: clerkUser.username || clerkUser.firstName || "User",
      email: clerkUser.primaryEmailAddress?.emailAddress,
      isAuthenticated: true,
    } : null,
    // ... implement other methods
  };

  return <AuthContext_Internal.Provider value={value}>{children}</AuthContext_Internal.Provider>;
}
```

### Option 3: NextAuth

```tsx
import { SessionProvider, useSession } from "next-auth/react";

export function NextAuthProvider({ children }) {
  const { data: session, status } = useSession();

  const value: AuthContextType = {
    user: session?.user ? {
      id: session.user.id,
      username: session.user.name || "User",
      email: session.user.email,
      isAuthenticated: true,
    } : null,
    // ... implement other methods
  };

  return <AuthContext_Internal.Provider value={value}>{children}</AuthContext_Internal.Provider>;
}
```

## Key Principle

**No component code changes required!** All components use `useAuth()` hook, which works the same regardless of the provider.

## Files Structure

```
src/lib/auth/
├── types.ts                    # Interface definitions (never changes)
├── AuthContext.tsx             # Hook and context (never changes)
├── index.ts                    # Public exports
├── providers/
│   ├── MockAuthProvider.tsx    # Current: Mock auth for dev
│   ├── SupabaseAuthProvider.tsx # Future: Supabase
│   ├── ClerkAuthProvider.tsx    # Future: Clerk
│   └── NextAuthProvider.tsx     # Future: NextAuth
└── README.md                   # This file
```

## API Reference

### `useAuth()` Hook

Returns:
- `user: AuthUser | null` - Current authenticated user
- `isLoading: boolean` - Loading state
- `isAuthenticated: boolean` - Quick check if user is logged in
- `login(credentials)` - Log in user
- `logout()` - Log out user
- `checkIsOwner(resourceId, type?)` - Check if user owns a resource
- `setMockRole?(role)` - Dev only: Switch mock role

### `AuthUser` Type

```typescript
interface AuthUser {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  isAuthenticated: boolean;
}
```
