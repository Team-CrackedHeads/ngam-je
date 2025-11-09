"""
Unsplash image search endpoints.

Simple HTTP wrapper for Unsplash API - no AI involved.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional

from src.app.core.logging_config import get_logger
from src.app.services import imagesearch

logger = get_logger("app.api.unsplash")

router = APIRouter()


class ImageSearchResponse(BaseModel):
    """Response model for image search."""
    images: List[imagesearch.UnsplashImage]
    total: int


@router.get("/search", response_model=ImageSearchResponse)
async def search_images(
    query: str = Query(..., description="Search query"),
    per_page: int = Query(30, le=30, description="Number of results"),
    orientation: Optional[str] = Query(None, description="Image orientation: landscape, portrait, squarish"),
):
    """
    Search Unsplash for images.

    Args:
        query: Search query (e.g., "running shoes", "laptop")
        per_page: Number of results (max 30)
        orientation: Filter by orientation
    """
    try:
        images = await imagesearch.search_unsplash(
            query=query,
            per_page=per_page,
            orientation=orientation,
        )
        return ImageSearchResponse(images=images, total=len(images))
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Unsplash search failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Image search failed: {str(e)}")


@router.get("/backgrounds", response_model=ImageSearchResponse)
async def search_backgrounds(
    style: Optional[str] = Query(None, description="Background style (e.g., marble, wood, minimal)"),
    per_page: int = Query(30, le=30, description="Number of results"),
):
    """
    Search for background images suitable for product photography.

    Args:
        style: Background style (e.g., "marble", "wood", "minimal")
        per_page: Number of results (max 30)
    """
    try:
        images = await imagesearch.search_backgrounds(
            style=style,
            per_page=per_page,
        )
        return ImageSearchResponse(images=images, total=len(images))
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Background search failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Background search failed: {str(e)}")
