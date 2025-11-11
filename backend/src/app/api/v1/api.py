"""
API v1 router aggregator.

This file combines all v1 endpoint routers into a single router.
When adding new endpoints, import them here and include them in the api_router.
"""

from fastapi import APIRouter

from src.app.api.v1.endpoints import health, users, kyc, unsplash, generation
from src.app.api.v1 import parlant_context

api_router = APIRouter()

# Include all endpoint routers
# Note: Auth is now handled by Clerk - no /auth endpoints needed
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(kyc.router, prefix="/kyc", tags=["kyc"])
api_router.include_router(generation.router, prefix="/generation", tags=["generation"])
api_router.include_router(unsplash.router, prefix="/unsplash", tags=["unsplash"])
api_router.include_router(parlant_context.router, tags=["parlant"])
