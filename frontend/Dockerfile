# ============================================================================
# Multi-stage Dockerfile for Ngam-je Frontend (Next.js 15)
# Optimized for Google Cloud Run deployment
# ============================================================================

# ============================================================================
# Stage 1: Dependencies - Install dependencies with Bun
# ============================================================================
FROM oven/bun:1 AS deps

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# ============================================================================
# Stage 2: Builder - Build the Next.js application
# ============================================================================
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Accept build arguments for environment variables needed at build time
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Set environment variables for the build
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Debug: Print environment variables
RUN echo "DEBUG: NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"

# Build Next.js application with standalone output
RUN bun run build

# ============================================================================
# Stage 3: Runner - Minimal production image with Node.js
# ============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

# Set to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port (Cloud Run uses PORT env var, defaults to 8080)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/', (r) => {if(r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["node", "server.js"]
