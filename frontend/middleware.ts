import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for protecting routes with authentication
 *
 * NOTE: Currently disabled - authentication is handled by the FastAPI backend.
 * Route protection is implemented at the component level using ProtectedRoute.
 *
 * This middleware can be re-enabled in the future if we need server-side
 * route protection by checking JWT tokens from localStorage/cookies.
 */
export async function middleware(request: NextRequest) {
  // Currently just pass through all requests
  // Auth protection is handled by ProtectedRoute component
  return NextResponse.next();
}

/**
 * Configure which routes this middleware runs on
 *
 * Protected routes that require authentication:
 * - /profile/*
 * - /listings/*
 * - /messages/*
 * - /settings/*
 * - /chat/*
 */
export const config = {
  matcher: [
    // Protected routes
    "/profile/:path*",
    "/listings/:path*",
    "/messages/:path*",
    "/settings/:path*",
    "/chat/:path*",
  ],
};
