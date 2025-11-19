import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/messages(.*)',
  '/profile(.*)',
  '/settings(.*)',
  '/chat/history(.*)',
  // Protect API routes
  '/api/create-checkout-session(.*)',
]);

// Define routes that require the Ngam-je Assistant feature
const requiresAssistantFeature = createRouteMatcher([
  '/chat/history(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Handle preflight OPTIONS requests before Clerk authentication
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin");
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, X-Clerk-Auth-Token",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400"
      }
    });
  }

  // Check if route requires authentication
  if (isProtectedRoute(req)) {
    console.log('[Middleware] Protected route accessed:', req.nextUrl.pathname);
    const { userId } = await auth();
    console.log('[Middleware] User ID:', userId);

    // This will automatically:
    // - Redirect to sign-in for page requests
    // - Return 401 for API requests
    await auth.protect();
  }

  // Additional feature-based authorization
  if (requiresAssistantFeature(req)) {
    const { has } = await auth();

    // Check if user has the ngam_assistant feature
    if (has && !has({ feature: 'ngam_assistant' })) {
      // For API routes, return 403
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return new Response(
          JSON.stringify({ error: 'This feature requires a subscription' }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        );
      }

      // For pages, redirect to current page with billing modal trigger
      const url = new URL(req.url);
      url.searchParams.set('showBilling', 'true');
      return Response.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
