# Database Migration Guide with Alembic

This guide explains how to manage database schema changes using Alembic, SQLAlchemy's database migration tool.

## Table of Contents

- [What is Alembic?](#what-is-alembic)
- [Why Use Alembic?](#why-use-alembic)
- [Alembic vs SQL Init Scripts](#alembic-vs-sql-init-scripts)
- [Getting Started](#getting-started)
- [Common Workflows](#common-workflows)
- [Converting Existing SQL Scripts](#converting-existing-sql-scripts)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## What is Alembic?

**Alembic is "Git for databases"** - it tracks and manages incremental changes to your database schema over time.

Just like Git tracks changes to your code, Alembic:
- Tracks database schema changes as version-controlled migration files
- Allows you to upgrade and downgrade between schema versions
- Provides a history of all schema changes
- Makes it easy to apply the same changes across development, staging, and production

### The Analogy

| Git | Alembic |
|-----|---------|
| Tracks code changes | Tracks database schema changes |
| `git commit` | `alembic revision` |
| `git log` | `alembic history` |
| `git checkout <commit>` | `alembic downgrade <revision>` |
| `git pull` & apply | `alembic upgrade head` |
| `.git/` directory | `alembic/versions/` directory |
| Commit messages | Migration messages |
| Merge conflicts | Schema conflicts (manual resolution) |
| Branch history | Migration chain |

## Why Use Alembic?

### Problems Without Alembic

Without a migration tool, teams typically:
- Manually write SQL scripts for each change
- Hard to track what's been applied where
- No way to rollback changes
- Difficult to keep dev/staging/prod in sync
- Risk of data loss or schema drift

### Benefits With Alembic

- ✅ **Version Control**: Schema changes are tracked in Git
- ✅ **Reproducibility**: Apply same changes across all environments
- ✅ **Rollback**: Downgrade to previous schema versions
- ✅ **Collaboration**: Multiple developers can work on schema changes
- ✅ **Automation**: Generate migrations from SQLAlchemy models
- ✅ **Safety**: Review changes before applying

## Alembic vs SQL Init Scripts

You have **two approaches** for managing your database schema:

### 1. SQL Init Scripts (Docker Entrypoint)

**Use for:**
- Initial seed data (reference data, default values)
- One-time setup scripts
- Development environment bootstrap

**Characteristics:**
- Runs **once** during initial Docker container setup
- Files in `/docker-entrypoint-initdb.d/` executed alphabetically
- Won't run again if database already exists
- No rollback capability
- No version tracking

**Example:**
```bash
database/init/
├── 01-seed-countries.sql
├── 02-seed-categories.sql
└── 03-seed-admin-user.sql
```

### 2. Alembic Migrations (Recommended for Schema)

**Use for:**
- All schema changes (tables, columns, indexes, constraints)
- Changes that need to be tracked over time
- Changes that need to be applied to production

**Characteristics:**
- Version-controlled incremental changes
- Can be applied, rolled back, and replayed
- Works across all environments
- Tracks what's been applied
- Can be automated

**Example:**
```bash
backend/alembic/versions/
├── 001_abc123_create_users_table.py
├── 002_def456_add_user_profiles.py
└── 003_ghi789_add_posts_table.py
```

### Recommended Hybrid Approach

```
Docker Init Scripts          Alembic Migrations
        ↓                            ↓
   Seed Data Only          All Schema Changes
        ↓                            ↓
database/init/              alembic/versions/
├── seed-data.sql           ├── 001_initial_schema.py
                            ├── 002_add_profiles.py
                            └── 003_add_posts.py
```

## Getting Started

### Prerequisites

Alembic is already configured in this project. The configuration is in:
- `backend/alembic.ini` - Alembic configuration
- `backend/alembic/env.py` - Environment setup (connects to your database)
- `backend/alembic/versions/` - Migration scripts directory

### Your First Migration

#### Step 1: Define Your Model

Create or modify a SQLAlchemy model in `backend/src/models/`:

```python
# backend/src/models/user.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from src.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

#### Step 2: Generate Migration

Alembic can **automatically detect** changes to your models:

```bash
cd backend

# Generate migration with autogenerate
uv run alembic revision --autogenerate -m "create users table"
```

This creates a new file like `alembic/versions/abc123_create_users_table.py`:

```python
def upgrade() -> None:
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
```

#### Step 3: Review & Edit (Optional)

Always review the generated migration before applying it:

```bash
# View the generated file
cat alembic/versions/abc123_create_users_table.py
```

You can manually edit it if needed (e.g., add data migrations, custom SQL).

#### Step 4: Apply Migration

```bash
# Apply all pending migrations
uv run alembic upgrade head
```

Output:
```
INFO  [alembic.runtime.migration] Running upgrade  -> abc123, create users table
```

#### Step 5: Verify

Check your database:
```bash
# Using psql
docker compose exec postgres psql -U ngamje -d ngamje_db -c "\d users"

# Or use pgAdmin at http://localhost:5050
```

## Common Workflows

### Creating a New Migration

After modifying your models:

```bash
cd backend

# Autogenerate migration from model changes
uv run alembic revision --autogenerate -m "descriptive message"

# Review the generated file in alembic/versions/

# Apply it
uv run alembic upgrade head
```

### Viewing Migration History

```bash
# Show all migrations
uv run alembic history

# Show current version
uv run alembic current

# Show detailed history with verbose output
uv run alembic history --verbose
```

Output:
```
abc123 -> def456 (head), add user profiles
<base> -> abc123, create users table
```

### Rolling Back Changes

```bash
# Rollback to previous migration
uv run alembic downgrade -1

# Rollback to specific revision
uv run alembic downgrade abc123

# Rollback all migrations
uv run alembic downgrade base
```

### Applying Specific Migrations

```bash
# Upgrade to specific revision
uv run alembic upgrade abc123

# Upgrade to latest
uv run alembic upgrade head

# Upgrade by relative amount
uv run alembic upgrade +2
```

### Creating Empty Migration (Manual SQL)

Sometimes you need to write custom SQL:

```bash
# Create empty migration
uv run alembic revision -m "custom data migration"
```

Then edit the file:

```python
def upgrade() -> None:
    # Custom SQL
    op.execute("""
        UPDATE users
        SET role = 'admin'
        WHERE email = 'admin@example.com'
    """)

def downgrade() -> None:
    # Reverse the change
    op.execute("""
        UPDATE users
        SET role = 'user'
        WHERE email = 'admin@example.com'
    """)
```

## Converting Existing SQL Scripts

If you have SQL scripts from another system (like Supabase), here's how to convert them:

### Option 1: Import as Initial Migration (Recommended)

Best for starting a new database with existing schema:

```bash
cd backend

# Create an empty migration
uv run alembic revision -m "initial schema from supabase"
```

Edit the generated file:

```python
def upgrade() -> None:
    # Paste your SQL here
    op.execute("""
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    op.execute("""
        CREATE TABLE posts (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            title VARCHAR(255) NOT NULL,
            content TEXT
        );
    """)

def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS posts;")
    op.execute("DROP TABLE IF EXISTS users;")
```

Apply it:
```bash
uv run alembic upgrade head
```

### Option 2: Define Models and Autogenerate

Better for long-term maintenance:

1. **Convert SQL to SQLAlchemy models** in `src/models/`
2. **Generate migration from models**:
   ```bash
   uv run alembic revision --autogenerate -m "initial schema"
   ```
3. **Review and apply**

### Option 3: Docker Init + Alembic (Hybrid)

For development environments:

1. **Put SQL in `database/init/`** for quick setup
2. **Use Alembic for future changes**
3. **For production**: Use only Alembic migrations

## Best Practices

### 1. Always Review Autogenerated Migrations

```bash
# After generating
cat alembic/versions/abc123_*.py

# Check what would be applied
uv run alembic upgrade head --sql > migration.sql
cat migration.sql
```

### 2. Write Descriptive Messages

```bash
# ✅ Good
uv run alembic revision --autogenerate -m "add user avatar and bio fields"

# ❌ Bad
uv run alembic revision --autogenerate -m "update"
```

### 3. Keep Migrations Small and Atomic

Each migration should represent a single logical change:

```bash
# ✅ Good - separate migrations
uv run alembic revision -m "add users table"
uv run alembic revision -m "add posts table"

# ❌ Bad - everything in one migration
uv run alembic revision -m "add all tables"
```

### 4. Test Migrations Before Committing

```bash
# Apply migration
uv run alembic upgrade head

# Test your app
uv run pytest

# If problems, rollback
uv run alembic downgrade -1

# Fix and regenerate
```

### 5. Always Write Downgrade Functions

Even if you think you won't use them:

```python
def upgrade() -> None:
    op.add_column('users', sa.Column('bio', sa.Text()))

def downgrade() -> None:
    op.drop_column('users', 'bio')
```

### 6. Coordinate with Team

- Pull latest migrations before creating new ones
- Avoid editing existing migrations that are already applied
- Communicate schema changes with team

### 7. Use Transactions

Alembic wraps migrations in transactions by default. For data migrations:

```python
def upgrade() -> None:
    # This will rollback if any statement fails
    op.execute("UPDATE users SET role = 'user' WHERE role IS NULL")
    op.alter_column('users', 'role', nullable=False)
```

## Troubleshooting

### Migration Already Applied

```
ERROR: Can't locate revision identified by 'abc123'
```

**Solution:**
```bash
# Check current state
uv run alembic current

# View history
uv run alembic history
```

### Autogenerate Didn't Detect Changes

**Common causes:**
1. Model not imported in `alembic/env.py`
2. Base metadata not including your models
3. No actual changes made

**Solution:**
```python
# In alembic/env.py, ensure all models are imported:
from src.models.user import User
from src.models.post import Post  # Add your models here
```

### Can't Downgrade

```
ERROR: Can't locate revision identified by '-1'
```

**Solution:**
```bash
# Check if you're already at base
uv run alembic current

# If at base, nothing to downgrade
```

### Merge Conflicts in Migrations

When two developers create migrations at the same time:

```bash
# Check heads
uv run alembic heads

# Merge them
uv run alembic merge -m "merge migrations" head1 head2
```

### Database Out of Sync

```bash
# Stamp database with current schema version
uv run alembic stamp head

# Or start fresh (⚠️ deletes data)
docker compose down -v
docker compose up -d
uv run alembic upgrade head
```

## Integration with Development Workflow

### Daily Development

```bash
# 1. Pull latest code
git pull

# 2. Apply any new migrations
cd backend
uv run alembic upgrade head

# 3. Start development
uv run fastapi dev
```

### Making Schema Changes

```bash
# 1. Edit your models
vim src/models/user.py

# 2. Generate migration
uv run alembic revision --autogenerate -m "add user avatar field"

# 3. Review migration
cat alembic/versions/xyz789_add_user_avatar_field.py

# 4. Apply it
uv run alembic upgrade head

# 5. Test your changes
uv run pytest

# 6. Commit everything
git add src/models/user.py alembic/versions/xyz789_add_user_avatar_field.py
git commit -m "feat: add user avatar field"
```

### Deployment to Production

```bash
# On production server
git pull

cd backend

# Backup database first!
pg_dump -U ngamje ngamje_db > backup_$(date +%Y%m%d).sql

# Apply migrations
uv run alembic upgrade head

# Start application
systemctl restart ngam-je-backend
```

## Additional Resources

### Official Documentation

- [Alembic Documentation](https://alembic.sqlalchemy.org/) - Official docs
- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html) - Getting started
- [Alembic Autogenerate](https://alembic.sqlalchemy.org/en/latest/autogenerate.html) - Auto-detection
- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/en/20/) - ORM reference

### Project Documentation

- [Backend README](../../backend/README.md) - Backend setup and architecture
- [Docker Setup Guide](../docker/setup.md) - Database setup with Docker
- [Git Workflow Guide](../git-workflow.md) - Git Flow conventions

### Quick Reference

```bash
# Common Commands Cheatsheet

# Create migration
uv run alembic revision --autogenerate -m "message"

# Apply migrations
uv run alembic upgrade head

# Rollback
uv run alembic downgrade -1

# View history
uv run alembic history

# Current version
uv run alembic current

# View SQL without applying
uv run alembic upgrade head --sql
```

### Migration File Template

```python
"""descriptive message

Revision ID: abc123
Revises: def456
Create Date: 2025-10-21 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'abc123'
down_revision: Union[str, None] = 'def456'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # ### commands auto generated by Alembic ###
    pass
    # ### end Alembic commands ###

def downgrade() -> None:
    # ### commands auto generated by Alembic ###
    pass
    # ### end Alembic commands ###
```

---

**Remember:** Alembic is your database's version control system. Treat migrations like commits - small, atomic, well-described, and thoroughly tested before applying to production.
