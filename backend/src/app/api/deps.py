"""
API dependencies.

Common dependencies that can be injected into API routes.
Examples: authentication, rate limiting, pagination, etc.
"""

from src.database import get_db

# Re-export get_db for convenience
__all__ = ["get_db", "get_current_user"]


# Example: Authentication dependency (to be implemented)
async def get_current_user():
    """
    Get current authenticated user.

    TODO: Implement authentication logic here.
    This could use JWT tokens, OAuth, or other auth methods.

    Example usage in a route:
        @router.get("/protected")
        def protected_route(user = Depends(get_current_user)):
            return {"user": user}
    """
    # Placeholder - implement your auth logic
    return {"user_id": 1, "username": "demo"}


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
