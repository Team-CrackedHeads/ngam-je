"use client";

import { createAuthClient } from "better-auth/react";

/**
 * BetterAuth Client
 *
 * Use this in client components to:
 * - Sign up users
 * - Sign in users
 * - Sign out users
 * - Get current session
 * - Check authentication status
 *
 * Example usage:
 *
 * ```tsx
 * import { authClient } from "@/lib/auth-client";
 *
 * function LoginForm() {
 *   const { data: session } = authClient.useSession();
 *
 *   const handleLogin = async (email: string, password: string) => {
 *     await authClient.signIn.email({ email, password });
 *   };
 *
 *   if (session) {
 *     return <div>Welcome {session.user.name}!</div>;
 *   }
 *
 *   return <button onClick={() => handleLogin(...)}>Login</button>;
 * }
 * ```
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

/**
 * Hooks exported for convenience
 */
export const { useSession } = authClient;
