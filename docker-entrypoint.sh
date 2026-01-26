#!/bin/bash
set -e

echo "==================================="
echo "Stream Manager Backend - Startup"
echo "==================================="

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h db -p 5432 -U postgres; do
  echo "  PostgreSQL is not ready yet, waiting..."
  sleep 2
done
echo "PostgreSQL is ready!"

# Run database migrations
# Note: migrate.js uses __dirname for paths, so we can run from anywhere
echo ""
echo "Running database migrations..."
bun run /app/apps/backend/scripts/migrate.js

# Start the backend server from /app so process.cwd() resolves correctly
# for WebDeck downloads (pythonScripts/, WebDeck/, public/ are at /app)
echo ""
echo "Starting backend server on port ${PORT:-3000}..."
cd /app
exec bun run apps/backend/src/index.ts
