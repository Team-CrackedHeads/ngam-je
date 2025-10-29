import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * BetterAuth API Route Handler
 *
 * This catch-all route handles ALL auth-related requests:
 *
 * POST /api/auth/sign-up
 *   - Register a new user
 *   - Body: { email: string, password: string, name?: string }
 *
 * POST /api/auth/sign-in/email
 *   - Login with email and password
 *   - Body: { email: string, password: string }
 *
 * POST /api/auth/sign-out
 *   - Logout current user
 *   - Clears session cookie
 *
 * GET /api/auth/session
 *   - Get current session data
 *   - Returns: { user, session } or null
 *
 * POST /api/auth/forget-password
 *   - Request password reset (when email service configured)
 *
 * POST /api/auth/reset-password
 *   - Reset password with token
 *
 * BetterAuth handles all the logic, validation, and security
 */
export const { GET, POST } = toNextJsHandler(auth);
