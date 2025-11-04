from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from src.database import get_db
from src.app.core.config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/", status_code=status.HTTP_200_OK)
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint.

    Verifies:
    - API is running
    - Database connection is healthy
    - Returns environment and version info
    """
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "environment": settings.env,
        "database": db_status,
        "gcp_integration": settings.use_secret_manager,
    }


@router.get("/ready", status_code=status.HTTP_200_OK)
async def readiness_check():
    """
    Readiness check for Kubernetes/Cloud Run.

    Returns 200 if the service is ready to accept traffic.
    """
    return {"status": "ready"}


@router.get("/live", status_code=status.HTTP_200_OK)
async def liveness_check():
    """
    Liveness check for Kubernetes/Cloud Run.

    Returns 200 if the service is alive.
    """
    return {"status": "alive"}
