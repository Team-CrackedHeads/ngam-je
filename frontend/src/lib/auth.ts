import { betterAuth } from "better-auth";
import { Pool } from "pg";

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * BetterAuth Server Configuration
 *
 * This handles all authentication operations:
 * - User registration (sign up)
 * - User login (sign in)
 * - Session management
 * - Password hashing
 *
 * BetterAuth automatically creates these tables in PostgreSQL:
 * - user (id, email, emailVerified, name, image, createdAt, updatedAt)
 * - session (id, expiresAt, userId, ipAddress, userAgent)
 * - account (for OAuth providers - optional)
 * - verification (for email verification - optional)
 */
export const auth = betterAuth({
  // Database configuration
  database: pool,

  // Email & Password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production with email service
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },

  // Security settings
  secret: process.env.BETTER_AUTH_SECRET!,

  // Base URL for redirects and callbacks
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  // Social providers (add when ready)
  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID!,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //   },
  // },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;