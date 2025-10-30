# Ngam-Je Backend

FastAPI-based backend service for the Ngam-Je AI-powered application.

## Tech Stack

### Core Framework
- **FastAPI** - Modern, fast web framework for building APIs with Python
- **Python 3.12** - Latest stable Python version
- **Uvicorn** - Lightning-fast ASGI server

### Database & ORM
- **PostgreSQL** - Primary relational database
- **SQLAlchemy 2.0** - SQL toolkit and Object-Relational Mapping
- **Alembic** - Database migration tool
- **psycopg2** - PostgreSQL adapter for Python

### Data Validation
- **Pydantic v2** - Data validation using Python type annotations
- **pydantic-settings** - Settings management using Pydantic

### AI & Machine Learning
- **LangChain** - Framework for developing AI applications
- **Google Gemini** - AI capabilities and language models

### Cloud Services
- **Google Cloud Secret Manager** - Secure secrets management for production
- **Google Cloud Storage (GCS)** - File storage solution

### Development Tools
- **uv** - Fast Python package manager and environment manager
- **Black** - Opinionated code formatter
- **Ruff** - Extremely fast Python linter
- **pre-commit** - Git hook framework for code quality checks
- **pytest** - Testing framework
- **pytest-asyncio** - Async test support

## Project Structure

Following the [FastAPI Bigger Applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/) pattern:

```
backend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/      # Individual route handlers
│   │   │   │   │   ├── health.py   # Health check endpoints
│   │   │   │   │   └── users.py    # User endpoints
│   │   │   │   └── api.py          # Router aggregator for v1
│   │   │   └── deps.py             # Shared dependencies
│   │   ├── core/
│   │   │   └── config.py           # Application configuration
│   │   ├── services/               # Business logic layer
│   │   │   └── user_service.py
│   │   └── main.py                 # FastAPI application entry point
│   ├── models/                     # SQLAlchemy models
│   │   └── user.py
│   ├── schemas/                    # Pydantic schemas
│   │   └── user.py
│   └── database.py                 # Database configuration
├── alembic/                        # Database migrations
├── tests/                          # Test files
├── .env.example                   # Environment variables template
├── pyproject.toml                 # Project dependencies and config
└── README.md                      # This file
```

### Key Architecture Decisions

- **Router Aggregation**: All v1 endpoints are combined in `api/v1/api.py`, making it easy to include the entire API version with a single import in `main.py`
- **Endpoint Organization**: Individual routers live in `api/v1/endpoints/`, keeping related functionality grouped
- **Scalability**: When adding new endpoints, simply create a new file in `endpoints/` and include it in `api.py`

## Getting Started

### Prerequisites

- Python 3.12
- [uv](https://docs.astral.sh/uv/) - Python package manager
- PostgreSQL 16 (via Docker recommended)

### Installation

1. **Start the Database**

For detailed Docker setup instructions, see the [Docker Setup Guide](../docs/docker/setup.md).

Quick start:

```bash
cd ..
docker-compose up -d postgres
```

2. **Set up Python Environment**

```bash
cd backend

# Install dependencies
uv sync
```

3. **Configure Environment**

```bash
# Copy example environment file
cp ../.env.example ../.env

# Edit .env with your settings (defaults work for local development)
```

4. **Run Database Migrations**

```bash
uv run alembic upgrade head
```

5. **Start the Development Server**

```bash
uv run fastapi dev
```

The API will be available at `http://localhost:8000`.

### API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

- `GET /` - Root endpoint
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation (ReDoc)
- `GET /api/v1/health` - Health check
- `GET /api/v1/health/ready` - Readiness probe (Cloud Run)
- `GET /api/v1/health/live` - Liveness probe (Cloud Run)
- `GET /api/v1/users` - List users
- `GET /api/v1/users/{id}` - Get user
- `POST /api/v1/users` - Create user

## Development Workflow

### Adding Dependencies

Use `uv` to add new dependencies:

```bash
# Add a production dependency
uv add package-name

# Add a development dependency
uv add --dev package-name

# Add with extras
uv add "package-name[extra]"
```

### Code Formatting & Linting

```bash
# Format code with Black
uv run black src/

# Lint with Ruff
uv run ruff check src/

# Auto-fix linting issues
uv run ruff check --fix src/
```

### Pre-commit Hooks

Set up pre-commit hooks to automatically check code quality:

```bash
uv run pre-commit install

# Run manually on all files
uv run pre-commit run --all-files
```

### Running Tests

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=src

# Run specific test file
uv run pytest tests/test_users.py

# Run with verbose output
uv run pytest -v
```

### Database Migrations

```bash
# Create a new migration
uv run alembic revision --autogenerate -m "Description of changes"

# Apply migrations
uv run alembic upgrade head

# Rollback last migration
uv run alembic downgrade -1

# View migration history
uv run alembic history
```

### Adding New API Endpoints

To add a new router (e.g., for items, AI features, etc.):

1. **Create endpoint file** in `src/app/api/v1/endpoints/`:

```python
# src/app/api/v1/endpoints/items.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database import get_db

router = APIRouter()

@router.get("/")
async def list_items(db: Session = Depends(get_db)):
    """List all items."""
    return {"items": []}

@router.get("/{item_id}")
async def get_item(item_id: int, db: Session = Depends(get_db)):
    """Get a specific item."""
    return {"item_id": item_id}
```

2. **Register in aggregator** (`src/app/api/v1/api.py`):

```python
from src.app.api.v1.endpoints import health, users, items  # Add import

api_router.include_router(items.router, prefix="/items", tags=["items"])  # Add router
```

That's it! Your new endpoints are now available at `/api/v1/items/`.

## Contributing

We welcome contributions! Here's how you can help:

### 1. Set Up Your Environment

Follow the [Getting Started](#getting-started) section above.

### 2. Create a Feature Branch

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feat/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions/updates

### 3. Make Your Changes

- Write clean, readable code
- Follow existing code style (Black + Ruff enforced)
- Add tests for new functionality
- Update documentation as needed
- Keep commits atomic and well-described

### 4. Test Your Changes

```bash
# Run tests
uv run pytest

# Check code quality
uv run black src/
uv run ruff check src/

# Run pre-commit checks
uv run pre-commit run --all-files
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add user authentication endpoint"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `test:` - Test updates
- `chore:` - Maintenance tasks

### 6. Push and Create Pull Request

```bash
git push origin feat/your-feature-name
```

Then create a Pull Request on the repository with:
- Clear description of changes
- Link to related issues
- Screenshots (if UI changes)
- Test results

### Code Review Process

1. All PRs require at least one approval
2. All tests must pass
3. Code must pass linting and formatting checks
4. Documentation must be updated if needed

## Configuration

### Environment Variables

Key environment variables (see `.env.example` for full list):

- `ENV` - Environment (development/staging/production)
- `DEBUG` - Enable debug mode
- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_*` - Database credentials
- `GCP_PROJECT_ID` - Google Cloud project ID
- `USE_SECRET_MANAGER` - Enable GCP Secret Manager
- `SECRET_KEY` - JWT secret key
- `CORS_ORIGINS` - Allowed CORS origins

### Settings Management

Configuration is managed via `src/app/core/config.py` using Pydantic settings:

```python
from src.app.core.config import get_settings

settings = get_settings()
database_url = settings.database_url
```

## Troubleshooting

### Common Issues

**Import Errors**
- Make sure you're using `uv run` to execute commands
- Check that all dependencies are installed: `uv sync`

**Database Connection Issues**
- Verify PostgreSQL is running: `docker-compose ps`
- Check `.env` configuration matches database settings
- Ensure migrations are applied: `uv run alembic upgrade head`

**Port Already in Use**
- Change `API_PORT` in `.env` to use a different port
- Kill process using port 8000: `lsof -ti:8000 | xargs kill -9`

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [uv Documentation](https://docs.astral.sh/uv/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
