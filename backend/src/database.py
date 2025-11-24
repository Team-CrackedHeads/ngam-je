import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from google.cloud.sql.connector import Connector
from google.oauth2 import service_account

from src.app.core.config import get_settings

settings = get_settings()

# Initialize the Cloud SQL Connector once (reuse across connections)
_connector = None


def get_connector():
    """Get or create the Cloud SQL Connector instance."""
    global _connector
    if _connector is None:
        # Load credentials from the service account JSON file if provided
        if settings.google_application_credentials and os.path.exists(
            settings.google_application_credentials
        ):
            credentials = service_account.Credentials.from_service_account_file(
                settings.google_application_credentials
            )
            _connector = Connector(credentials=credentials)
        else:
            _connector = Connector()
    return _connector


# Google Cloud SQL Connector function
def getconn():
    """Create a connection to Cloud SQL using the Connector."""
    if not settings.instance_connection_name:
        raise ValueError("INSTANCE_CONNECTION_NAME is not set in settings.")
    connector = get_connector()
    conn = connector.connect(
        settings.instance_connection_name,
        "pg8000",
        user=settings.postgres_user,
        password=settings.postgres_password,
        db=settings.postgres_db,
    )
    return conn


# Create SQLAlchemy engine
# Use Cloud SQL Connector if INSTANCE_CONNECTION_NAME is set, otherwise use standard connection
if settings.instance_connection_name:
    engine = create_engine(
        "postgresql+pg8000://",
        creator=getconn,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        echo=settings.debug,
    )
else:
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        echo=settings.debug,
    )

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function for FastAPI routes to get database sessions.

    Yields:
        Session: SQLAlchemy database session

    Example:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database tables.

    This creates all tables defined by models inheriting from Base.
    In production, use Alembic migrations instead.
    """
    Base.metadata.create_all(bind=engine)
