"""
API dependencies.

Common dependencies that can be injected into API routes.
Examples: authentication, rate limiting, pagination, etc.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from src.app.core.clerk_auth import verify_clerk_token
from src.database import get_db
from src.models.user import User

# Re-export get_db for convenience
__all__ = ["get_db", "get_current_user", "get_or_create_user_from_clerk", "PaginationParams"]

# HTTP Bearer token scheme
security = HTTPBearer()


def get_or_create_user_from_clerk(clerk_user_id: str, email: str, username: str, db: Session) -> User:
    """
    Get or create a user from Clerk authentication.

    Args:
        clerk_user_id: Clerk user ID
        email: User email
        username: Username
        db: Database session

    Returns:
        User object
    """
    # Try to find existing user by Clerk ID
    user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()

    if not user:
        # Create new user
        user = User(
            clerk_user_id=clerk_user_id,
            email=email,
            username=username,
            is_active=True,
            is_superuser=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Get current authenticated user from Clerk JWT token.

    Extracts and validates Clerk JWT token from Authorization header.

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

    # Verify Clerk token and extract payload
    payload = verify_clerk_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Clerk token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract user info from Clerk token
    clerk_user_id = payload.get("sub")  # Clerk user ID
    email = payload.get("email")
    username = payload.get("username") or email.split("@")[0]  # Fallback to email prefix

    if not clerk_user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload - missing user info",
        )

    # Get or create user in our database
    user = get_or_create_user_from_clerk(clerk_user_id, email, username, db)

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
