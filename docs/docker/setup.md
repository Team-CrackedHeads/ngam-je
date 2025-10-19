# Docker Setup Guide

This guide will help you set up the Ngam-Je development environment using Docker.

## Prerequisites

- Docker Engine (20.10+)
- Docker Compose (2.0+)
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ngam-je
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your preferred settings. The defaults are configured for local development.

### 3. Start Services

Start the PostgreSQL database and pgAdmin:

```bash
docker-compose up -d postgres pgadmin
```

This will:
- Pull the PostgreSQL 16 Alpine image
- Pull the pgAdmin 4 image
- Create persistent volumes for database and pgAdmin data
- Expose PostgreSQL on port 5432
- Expose pgAdmin web UI on port 5050
- Run health checks to ensure the database is ready

### 4. Verify Services are Running

```bash
docker-compose ps
```

You should see both `ngam-je-postgres` and `ngam-je-pgadmin` services running and healthy.

### 5. Access the Database

#### Option 1: Using pgAdmin (Recommended - Web UI)

1. Open your browser and navigate to: **http://localhost:5050**

2. Login with the credentials from your `.env` file:
   - Email: `admin@ngamje.local` (default)
   - Password: `admin` (default)

3. Add a new server connection:
   - Right-click "Servers" → "Register" → "Server"

   **General Tab:**
   - Name: `Ngam-Je Local`

   **Connection Tab:**
   - Host: `postgres` (use service name, not localhost)
   - Port: `5432`
   - Maintenance database: `ngamje_db`
   - Username: `ngamje`
   - Password: `ngamje_dev_password`
   - Save password: ✓ (check this)

4. Click "Save" - you should now be connected!

#### Option 2: Using psql (Command Line)

```bash
docker-compose exec postgres psql -U ngamje -d ngamje_db
```

#### Option 3: Using External Database Client

Connect using any PostgreSQL client (DBeaver, DataGrip, etc.) with:
- Host: `localhost`
- Port: `5432`
- User: `ngamje`
- Password: `ngamje_dev_password` (or your configured password)
- Database: `ngamje_db`

## Running the Backend (Local Development)

For local development, we recommend running the backend outside of Docker for faster iteration:

```bash
cd backend
uv sync
uv run fastapi dev
```

The backend will be available at `http://localhost:8000`.

## Running the Backend (Docker - Optional)

To run the backend in Docker, uncomment the backend service in `docker-compose.yml` and run:

```bash
docker-compose up -d backend
```

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# PostgreSQL only
docker-compose logs -f postgres

# pgAdmin only
docker-compose logs -f pgadmin

# Backend only (if running in Docker)
docker-compose logs -f backend
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop specific service
docker-compose stop postgres
docker-compose stop pgadmin
```

### Stop and Remove Volumes (⚠️ This will delete all data)

```bash
docker-compose down -v
```

**Note**: This will delete:
- All database data
- All pgAdmin configuration (saved servers, preferences)

### Restart Services

```bash
# Restart specific services
docker-compose restart postgres
docker-compose restart pgadmin

# Restart all services
docker-compose restart
```

### Start/Stop Individual Services

```bash
# Start only PostgreSQL
docker-compose up -d postgres

# Start both PostgreSQL and pgAdmin
docker-compose up -d postgres pgadmin

# Stop pgAdmin but keep PostgreSQL running
docker-compose stop pgadmin
```

## Database Migrations

After the database is running, apply migrations:

```bash
cd backend
uv run alembic upgrade head
```

## Troubleshooting

### Port Already in Use

**PostgreSQL Port (5432)**

If port 5432 is already in use, change `POSTGRES_PORT` in `.env`:

```env
POSTGRES_PORT=5433
```

Then update the `DATABASE_URL` accordingly.

**pgAdmin Port (5050)**

If port 5050 is already in use, change `PGADMIN_PORT` in `.env`:

```env
PGADMIN_PORT=5051
```

### Database Connection Issues

1. Check if PostgreSQL is healthy:
   ```bash
   docker-compose ps
   ```

2. Check PostgreSQL logs:
   ```bash
   docker-compose logs postgres
   ```

3. Verify environment variables in `.env` match your connection settings

### pgAdmin Connection Issues

**Cannot connect to PostgreSQL from pgAdmin:**

1. Make sure you're using `postgres` as the hostname (not `localhost`)
   - pgAdmin runs in a container and needs to use the Docker service name
   - ✅ Correct: `postgres`
   - ❌ Wrong: `localhost` or `127.0.0.1`

2. Verify PostgreSQL is running:
   ```bash
   docker-compose ps postgres
   ```

3. Check that both services are on the same network:
   ```bash
   docker network inspect ngam-je-network
   ```

**Cannot access pgAdmin web UI:**

1. Verify pgAdmin is running:
   ```bash
   docker-compose ps pgadmin
   ```

2. Check pgAdmin logs:
   ```bash
   docker-compose logs pgadmin
   ```

3. Ensure port 5050 is not blocked by firewall

**Forgot pgAdmin password:**

Stop and remove pgAdmin volume, then restart:
```bash
docker-compose stop pgadmin
docker volume rm ngam-je_pgadmin_data
docker-compose up -d pgadmin
```

This will reset pgAdmin to default credentials from `.env`.

### Permission Issues

If you encounter permission issues with volumes:

```bash
docker-compose down
sudo chown -R $USER:$USER ./
docker-compose up -d
```

## Network Architecture

All services run on the `ngam-je-network` bridge network, allowing them to communicate with each other using service names.

## Data Persistence

Data is stored in Docker volumes and persists even when containers are stopped or removed (unless you use `docker-compose down -v`):

- **`postgres_data`**: PostgreSQL database files
- **`pgadmin_data`**: pgAdmin configuration and saved server connections

To backup your data, you can use Docker volume commands or pgAdmin's built-in backup tools.
