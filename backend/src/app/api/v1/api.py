"""
API v1 router aggregator.

This file combines all v1 endpoint routers into a single router.
When adding new endpoints, import them here and include them in the api_router.
"""

from fastapi import APIRouter

from src.app.api.v1.endpoints import health, users, kyc, threads, listings, faqs, faq_replies

api_router = APIRouter()

# Include all endpoint routers
# Note: Auth is now handled by Clerk - no /auth endpoints needed
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(kyc.router, prefix="/kyc", tags=["kyc"])
api_router.include_router(threads.router, prefix="/threads", tags=["threads"])
api_router.include_router(listings.router, prefix="/listings", tags=["listings"])
api_router.include_router(faqs.router, prefix="/faqs", tags=["faqs"])
api_router.include_router(faq_replies.router, prefix="/faq-replies", tags=["faq-replies"])

# Future routers can be added here:
# api_router.include_router(items.router, prefix="/items", tags=["items"])
# api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
