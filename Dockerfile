# Use Bun as base image
FROM oven/bun:1-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies using Bun
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate initial migration if drizzle directory doesn't exist
RUN if [ ! -d "./drizzle" ]; then \
      echo "No migrations found, creating initial migration..." && \
      bun run db:generate || echo "No schema changes to migrate"; \
    fi

# Build the application
RUN bun run build && echo "Build completed, listing contents:" && ls -la && echo "Checking for common output directories:" && ls -la .output/ 2>/dev/null || echo "No .output directory" && ls -la dist/ 2>/dev/null || echo "No dist directory" && ls -la build/ 2>/dev/null || echo "No build directory"

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 appgroup
RUN adduser --system --uid 1001 appuser --ingroup appgroup

# Install only production dependencies
COPY package.json bun.lockb* ./
RUN bun install --production --frozen-lockfile

# Copy the built application and all necessary files
COPY --from=builder /app ./

# Create a non-root user to run the app
USER appuser

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["bun", "start"]
