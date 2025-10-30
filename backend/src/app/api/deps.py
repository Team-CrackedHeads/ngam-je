"""
API dependencies.

Common dependencies that can be injected into API routes.
Examples: authentication, rate limiting, pagination, etc.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from src.app.core.security import verify_token
from src.database import get_db
from src.models.user import User

# Re-export get_db for convenience
__all__ = ["get_db", "get_current_user", "PaginationParams"]

# HTTP Bearer token scheme
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Get current authenticated user from JWT token.

    Extracts and validates JWT token from Authorization header.

    Args:
        credentials: HTTP Bearer credentials from Authorization header
        db: Database session

    Returns:
        User object if token is valid

    Raises:
        HTTPException: If token is invalid or user not found

    Example usage in a route:
        @router.get("/protected")
        def protected_route(user: User = Depends(get_current_user)):
            return {"user": user}
    """
    token = credentials.credentials

    # Verify token and extract payload
    payload = verify_token(token, token_type="access")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # Get user from database
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    return user


# Example: Pagination dependency
class PaginationParams:
    """
    Common pagination parameters.

    Usage in a route:
        @router.get("/items")
        def list_items(
            pagination: PaginationParams = Depends(),
            db: Session = Depends(get_db)
        ):
            items = db.query(Item).offset(pagination.skip).limit(pagination.limit).all()
            return items
    """

    def __init__(self, skip: int = 0, limit: int = 100):
        self.skip = skip
        self.limit = min(limit, 100)  # Cap at 100 items per request
