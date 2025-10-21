# Ngam-Je

An AI-powered full-stack application built with modern technologies for agentic AI workflows.

## Tech Stack

### Frontend

- **Next.js 15** with TypeScript
- **React 19** for UI components
- **Tailwind CSS** for styling
- **Bun** for package management
- **ESLint** for code quality

### Backend

- **FastAPI** with Python 3.12
- **uv** for dependency management
- **Pydantic v2** for data validation
- **SQLAlchemy 2.0** for ORM
- **Alembic** for database migrations
- **LangChain** for AI orchestration
- **Google Gemini** for AI capabilities

### Database & Infrastructure

- **PostgreSQL 16** (Alpine) for relational database
- **pgAdmin 9.9** for database management
- **Docker & Docker Compose** for containerization
- **Alembic** for version-controlled schema migrations
- **Google Cloud Storage** (GCS) for file storage
- **Google Cloud Secret Manager** for production secrets

### Development Tools

- **Black** & **Ruff** for Python code quality
- **pytest** for backend testing
- **pre-commit** for automated code checks

## Project Structure

```
ngam-je/
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities
│   └── package.json
├── backend/              # FastAPI application
│   ├── src/
│   │   ├── app/         # API routes & business logic
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   └── database.py  # Database configuration
│   ├── alembic/         # Database migrations
│   ├── tests/           # Backend tests
│   └── pyproject.toml
├── docs/                # Documentation
│   ├── docker/          # Docker setup guides
│   ├── database/        # Database & Alembic guides
│   ├── features/        # Feature documentation
│   └── git/             # Git workflow guides
├── git-scripts/         # Git automation scripts
├── docker-compose.yml   # Docker services configuration
└── README.md
```

## Quick Start

### Prerequisites

- **Docker** (20.10+) & **Docker Compose** (2.0+)
- **Python 3.12**
- **Bun** (latest)
- **uv** - Python package manager ([install](https://docs.astral.sh/uv/))
- **Git**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ngam-je
```

### 2. Start Database Services

```bash
# Start PostgreSQL and pgAdmin
docker compose up -d
```

**Access Services:**
- PostgreSQL: `localhost:5432`
- pgAdmin: http://localhost:5050 (Email: `admin@localhost.com`, Password: `admin`)

For detailed Docker setup, see [Docker Setup Guide](docs/docker/setup.md).

### 3. Backend Setup

```bash
cd backend

# Install dependencies
uv sync

# Run database migrations
uv run alembic upgrade head

# Start development server
uv run fastapi dev
```

The API will be available at http://localhost:8000

**API Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

For detailed backend setup, see [Backend README](backend/README.md).

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
bun install

# Start development server
bun dev
```

The frontend will be available at http://localhost:3000

## Development Workflow

### Database Migrations

We use **Alembic** for version-controlled database schema changes (think "Git for databases"):

```bash
cd backend

# Create a new migration after changing models
uv run alembic revision --autogenerate -m "add user profiles"

# Apply migrations
uv run alembic upgrade head

# Rollback last migration
uv run alembic downgrade -1

# View migration history
uv run alembic history
```

For a comprehensive guide on Alembic, see [Database Migration Guide](docs/database/alembic-guide.md).

### Code Quality

**Backend:**
```bash
cd backend

# Format code
uv run black src/

# Lint code
uv run ruff check src/

# Run tests
uv run pytest
```

**Frontend:**
```bash
cd frontend

# Lint code
bun run lint

# Type check
bun run type-check
```

### Adding Dependencies

**Backend:**
```bash
cd backend
uv add package-name              # Production dependency
uv add --dev package-name        # Development dependency
```

**Frontend:**
```bash
cd frontend
bun add package-name             # Production dependency
bun add --dev package-name       # Development dependency
```

## Documentation

- [Docker Setup Guide](docs/docker/setup.md) - Complete Docker and database setup
- [Backend README](backend/README.md) - Backend architecture and development
- [Database Migration Guide](docs/database/alembic-guide.md) - Alembic workflow and best practices
- [Git Workflow Guide](docs/git-workflow.md) - Git Flow strategy and conventions

## Architecture

This project follows a **monorepo architecture** with clear separation between frontend and backend:

- **Frontend**: Next.js with App Router, server-side rendering
- **Backend**: FastAPI with layered architecture (API → Services → Models)
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic migrations
- **Infrastructure**: Docker Compose for local development, GCP for production

## Contributing

We welcome contributions! Please follow these steps:

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes following our code style
3. Run tests and linting
4. Commit with conventional commits: `feat:`, `fix:`, `docs:`, etc.
5. Push and create a Pull Request

For detailed guidelines, see [Backend Contributing](backend/README.md#contributing).

## License

See LICENSE file for details.
