import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Define which routes require authentication
const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",
  "/listings(.*)",
  "/messages(.*)",
  "/settings(.*)",
  "/chat(.*)",
  "/dashboard(.*)",
]);

export default function middleware(req: NextRequest) {
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

  // Continue with Clerk authentication for all other requests
  return clerkMiddleware(async (auth, request) => {
    // Protect routes that require authentication
    if (isProtectedRoute(request)) {
      await auth.protect();
    }
  })(req);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
