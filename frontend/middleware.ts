import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Middleware for protecting routes with authentication
 *
 * This runs on EVERY request before pages load.
 * It checks if the user is authenticated and redirects accordingly.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/threads",
    "/api",
  ];

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  );

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected route - check authentication
  try {
    // Get session from BetterAuth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // If no session, redirect to login
    if (!session) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // User is authenticated, allow access
    return NextResponse.next();
  } catch (error) {
    // If there's an error checking auth, redirect to login
    console.error("Auth middleware error:", error);
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }
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
