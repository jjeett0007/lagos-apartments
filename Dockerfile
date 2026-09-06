# syntax=docker/dockerfile:1

# ==============================================================================
# Stage 1: Dependencies
# ==============================================================================
FROM oven/bun:1-debian AS deps
WORKDIR /app

# Install system dependencies needed for native modules & TLS
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests and Prisma schema for pre-build generation
COPY package.json bun.lock ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install dependencies deterministically (postinstall triggers `prisma generate`)
RUN bun install --frozen-lockfile

# ==============================================================================
# Stage 2: Builder
# ==============================================================================
FROM oven/bun:1-debian AS builder
WORKDIR /app

# Copy dependencies and generated prisma client from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/generated ./src/generated
COPY . .

# Set environment variables for production build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Safe build-time dummy connection string (Next.js & Prisma require a URL syntax at build time)
ENV DATABASE_URL="postgresql://build_user:build_pass@localhost:5432/eko_space_build"

# Build Next.js application with standalone output
RUN bun run build

# ==============================================================================
# Stage 3: Runner (Production)
# ==============================================================================
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install runtime SSL certificates for database and outbound API connections
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy public static assets
COPY --from=builder /app/public ./public

# In Next.js standalone mode, server.js and minimal node_modules are in .next/standalone
COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static

# Copy Prisma schema and migrations for optional runtime database deployment tasks
COPY --from=builder --chown=bun:bun /app/prisma ./prisma
COPY --from=builder --chown=bun:bun /app/prisma.config.ts ./

# Switch to non-root user for security
USER bun

EXPOSE 3000

# Run the standalone Next.js server with Bun
CMD ["bun", "server.js"]
