# Use Node.js for build and runtime
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies using npm
COPY package.json bun.lockb* ./
RUN npm ci --include=dev || npm install --include=dev

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Set environment variables for build (skip validation during build)
ENV SKIP_ENV_VALIDATION=1
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate initial migration if drizzle directory doesn't exist
RUN if [ ! -d "./drizzle" ]; then \
      echo "No migrations found, creating initial migration..." && \
      npx drizzle-kit generate || echo "No schema changes to migrate"; \
    fi

# Generate Python scripts from TypeScript data files
RUN npx tsx scripts/generate-python-scripts.ts

# Build the application using Node.js
RUN npx vinxi build || (echo "Build failed!" && exit 1)
RUN echo "Build completed, verifying output:" && \
    ls -la .output/ 2>/dev/null || (echo "ERROR: .output directory not found!" && exit 1) && \
    ls -la .output/server/ 2>/dev/null || (echo "ERROR: .output/server directory not found!" && exit 1) && \
    test -f .output/server/index.mjs || (echo "ERROR: .output/server/index.mjs not found!" && exit 1) && \
    echo "Build output verified successfully"

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 appgroup
RUN adduser --system --uid 1001 appuser --ingroup appgroup

# Copy the built application and all necessary files
COPY --from=builder /app ./

# Install only production dependencies
# This will update node_modules to production-only, removing dev dependencies
RUN npm ci --omit=dev || npm install --production

# Verify that the build output exists
RUN test -f .output/server/index.mjs || (echo "ERROR: .output/server/index.mjs missing in final image!" && ls -la .output/ 2>/dev/null || echo "ERROR: .output directory missing!" && exit 1) && \
    echo "Build output verified in final image"

# Create a non-root user to run the app
USER appuser

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["npm", "start"]
