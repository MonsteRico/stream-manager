# Drizzle Migration Guide

This guide explains how to work with Drizzle migrations in your Stream Manager project.

## Overview

Your project now uses proper Drizzle migrations instead of the `db:push` command for production deployments. This provides better version control and rollback capabilities.

## Development Workflow

### 1. Making Schema Changes

When you modify your database schema in `app/db/schema.ts`:

```bash
# Generate a new migration file
bun run db:generate
```

This creates a new migration file in the `drizzle/` directory with a timestamp prefix.

### 2. Applying Migrations Locally

```bash
# Apply migrations to your local database
bun run db:migrate
```

### 3. Development with Push (Quick Iteration)

For rapid development, you can still use the push command:

```bash
# Push schema changes directly (development only)
bun run db:push
```

## Production Deployment

### Automatic Migrations

Migrations run automatically when the Docker container starts:

```bash
docker-compose up -d
```

The application will:

1. Wait for the database to be healthy
2. Run any pending migrations
3. Start the application

### Manual Migration Commands

```bash
# Run migrations manually in Docker
docker-compose exec app bun run db:migrate:docker

# Or use the dedicated migration service
docker-compose --profile migrate up migrate
```

## Migration Files

Migration files are stored in the `drizzle/` directory and follow this naming pattern:

```
drizzle/
├── 0000_initial_migration.sql
├── 0001_add_user_table.sql
└── 0002_add_indexes.sql
```

## Best Practices

### 1. Always Generate Migrations for Schema Changes

```bash
# After modifying schema.ts
bun run db:generate
```

### 2. Review Migration Files

Always review the generated migration files before applying them to ensure they're correct.

### 3. Test Migrations Locally

```bash
# Test migrations on a copy of production data
bun run db:migrate
```

### 4. Backup Before Major Migrations

```bash
# Create a database backup
docker-compose exec postgres pg_dump -U stream_manager stream_manager > backup.sql
```

## Troubleshooting

### Migration Fails

If a migration fails:

1. Check the logs:

    ```bash
    docker-compose logs app
    ```

2. Fix the migration file or schema
3. Regenerate if needed:
    ```bash
    bun run db:generate
    ```

### Database Out of Sync

If your database is out of sync:

1. Check current migration status
2. Reset if needed (⚠️ **This will delete all data**):
    ```bash
    docker-compose down -v
    docker-compose up -d
    ```

### Missing Migration Files

If migration files are missing:

1. Generate initial migration:

    ```bash
    bun run db:generate
    ```

2. The Docker build will automatically generate migrations if none exist

## Commands Reference

| Command                     | Purpose                  | Environment      |
| --------------------------- | ------------------------ | ---------------- |
| `bun run db:generate`       | Generate migration files | Development      |
| `bun run db:migrate`        | Apply migrations         | Development      |
| `bun run db:push`           | Push schema directly     | Development only |
| `bun run db:migrate:docker` | Run migrations in Docker | Production       |
| `bun run db:studio`         | Open Drizzle Studio      | Any              |

## Migration vs Push

-   **Migrations**: Version-controlled, reversible, production-safe
-   **Push**: Direct schema sync, development-only, not version-controlled

Use migrations for production deployments and push for rapid development iteration.
