#!/usr/bin/env node

/**
 * Migration script for Docker deployment
 * This script handles database migrations in a production environment
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { readdir } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error("❌ DATABASE_URL environment variable is required");
        process.exit(1);
    }

    console.log("🔄 Starting database migration...");

    try {
        // Create database connection
        const connection = postgres(databaseUrl, { max: 1 });
        const db = drizzle(connection);

        // Check if migrations directory exists
        const migrationsDir = join(__dirname, "../drizzle");

        try {
            await readdir(migrationsDir);
        } catch (error) {
            console.log("📁 No migrations directory found, creating initial migration...");
            console.log("💡 Run 'npm run db:generate' locally to create migrations");
            await connection.end();
            return;
        }

        // Run migrations
        await migrate(db, { migrationsFolder: migrationsDir });

        console.log("✅ Database migration completed successfully");

        await connection.end();
    } catch (error) {
        console.error("❌ Migration failed:", error.message);
        process.exit(1);
    }
}

// Run migrations if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runMigrations();
}

export { runMigrations };
