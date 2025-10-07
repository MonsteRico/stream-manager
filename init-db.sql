-- Initialize the database with any required extensions or initial setup
-- This file is executed when the PostgreSQL container starts for the first time

-- Create any required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The application will handle table creation through Drizzle migrations
