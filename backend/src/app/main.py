from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.app.core.config import get_settings
from src.app.api.v1.api import api_router

settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="Ngam-je API",
    description="Backend API for Ngam-je application",
    version="0.1.0",
    debug=settings.debug,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 router (aggregates all v1 endpoints)
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Ngam-je API",
        "version": "0.1.0",
        "environment": settings.env,
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "src.app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload,
    )
