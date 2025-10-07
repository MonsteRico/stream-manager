# Docker Self-Hosted Setup

This document provides instructions for setting up the Stream Manager application using Docker for self-hosting.

## Required Ports

For router port forwarding, you need to open the following ports:

-   **Port 3000** (or custom `APP_PORT`): Main application (HTTP)
-   **Port 5432** (or custom `DB_PORT`): PostgreSQL database (optional - only if you need external database access)

### Port Configuration

You can customize the external ports by setting environment variables:

-   `APP_PORT`: External port for the web application (default: 3000)
-   `DB_PORT`: External port for the database (default: 5432)

**Example**: To use port 5001 for your application:

```bash
APP_PORT=5001
```

## Quick Start

1. **Clone and navigate to the project directory**

    ```bash
    cd stream-manager
    ```

2. **Set up environment variables**

    ```bash
    cp env.example .env
    ```

    Edit `.env` and fill in your values:

    - `POSTGRES_PASSWORD`: Choose a secure password for the database
    - `STARTGG_API_TOKEN`: Your Start.gg API token
    - `UPLOADTHING_TOKEN`: Your UploadThing token
    - `APP_PORT`: External port for the application (default: 3000)
    - `DB_PORT`: External port for the database (default: 5432)

3. **Start the services**

    ```bash
    docker-compose up -d
    ```

4. **Initialize the database**

    The database will be automatically migrated when the application starts. If you need to run migrations manually:

    ```bash
    # Run migrations manually
    docker-compose exec app npm run db:migrate:docker

    # Or use the migration service
    docker-compose --profile migrate up migrate
    ```

5. **Access the application**
    - Main application: http://localhost:${APP_PORT:-3000}
    - Database (if needed): localhost:${DB_PORT:-5432}

## Services

### Application (Configurable Port)

-   **Container**: `stream-manager-app`
-   **Purpose**: Main Stream Manager web application
-   **External Port**: Configurable via `APP_PORT` (default: 3000)
-   **Internal Port**: Always 3000
-   **Health Check**: HTTP endpoint check every 30 seconds

### Database (Configurable Port)

-   **Container**: `stream-manager-db`
-   **Purpose**: PostgreSQL database for storing sessions and teams
-   **External Port**: Configurable via `DB_PORT` (default: 5432)
-   **Internal Port**: Always 5432
-   **Health Check**: PostgreSQL connection check every 10 seconds

## Environment Variables

| Variable            | Description        | Required | Default                   |
| ------------------- | ------------------ | -------- | ------------------------- |
| `POSTGRES_PASSWORD` | Database password  | Yes      | `stream_manager_password` |
| `STARTGG_API_TOKEN` | Start.gg API token | Yes      | -                         |
| `UPLOADTHING_TOKEN` | UploadThing token  | Yes      | -                         |
| `APP_PORT`          | External app port  | No       | `3000`                    |
| `DB_PORT`           | External DB port   | No       | `5432`                    |

## Useful Commands

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Stop services

```bash
docker-compose down
```

### Stop and remove volumes (⚠️ This will delete all data)

```bash
docker-compose down -v
```

### Rebuild application

```bash
docker-compose build app
docker-compose up -d app
```

### Database operations

```bash
# Access database shell
docker-compose exec postgres psql -U stream_manager -d stream_manager

# Run database migrations manually
docker-compose exec app npm run db:migrate:docker

# Generate new migrations (run locally during development)
npm run db:generate

# Open Drizzle Studio (database GUI)
docker-compose exec app npm run db:studio
```

## Production Considerations

1. **Security**: Change default passwords and use strong credentials
2. **SSL/TLS**: Consider using a reverse proxy (nginx, traefik) with SSL certificates
3. **Backups**: Set up regular database backups
4. **Monitoring**: Consider adding monitoring and logging solutions
5. **Updates**: Regularly update Docker images for security patches

## Troubleshooting

### Application won't start

-   Check logs: `docker-compose logs app`
-   Verify environment variables are set correctly
-   Ensure database is healthy: `docker-compose ps`

### Database connection issues

-   Check database logs: `docker-compose logs postgres`
-   Verify database is running: `docker-compose ps`
-   Check network connectivity between containers

### Port conflicts

-   Change ports using environment variables in `.env`:
    ```bash
    APP_PORT=5001
    DB_PORT=5433
    ```
-   Update router port forwarding accordingly
-   Restart containers after changing ports:
    ```bash
    docker-compose down
    docker-compose up -d
    ```
