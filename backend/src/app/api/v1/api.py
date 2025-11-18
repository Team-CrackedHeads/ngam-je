"""
API v1 router aggregator.

This file combines all v1 endpoint routers into a single router.
When adding new endpoints, import them here and include them in the api_router.
"""

from fastapi import APIRouter

from src.app.api.v1.endpoints import (
    health,
    users,
    kyc,
    unsplash,
    generation,
    threads,
    listings,
    faqs,
    faq_replies,
    recommendations,
    conversations,
    messages,
    upload,
    payments,
)

api_router = APIRouter()

# Include all endpoint routers
# Note: Auth is now handled by Clerk - no /auth endpoints needed
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(kyc.router, prefix="/kyc", tags=["kyc"])
api_router.include_router(generation.router, prefix="/generation", tags=["generation"])
api_router.include_router(unsplash.router, prefix="/unsplash", tags=["unsplash"])
api_router.include_router(threads.router, prefix="/threads", tags=["threads"])
api_router.include_router(listings.router, prefix="/listings", tags=["listings"])
api_router.include_router(faqs.router, prefix="/faqs", tags=["faqs"])
api_router.include_router(faq_replies.router, prefix="/faq-replies", tags=["faq-replies"])
api_router.include_router(
    recommendations.router, prefix="/recommendations", tags=["recommendations"]
)
api_router.include_router(conversations.router, prefix="/conversations", tags=["conversations"])
api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
