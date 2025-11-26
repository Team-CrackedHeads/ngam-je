"""
Unsplash API service for image search.

Simple wrapper around Unsplash API - just HTTP calls, no AI involved.
"""

import httpx
from typing import List, Optional
from pydantic import BaseModel

from src.app.core.logging_config import get_logger
from src.app.services.imagesearch.config import get_unsplash_settings

logger = get_logger("app.services.imagesearch.unsplash")


class UnsplashImage(BaseModel):
    """Image result from Unsplash API."""

    url: str
    thumbnail_url: str
    width: int
    height: int
    description: Optional[str] = None
    photographer: Optional[str] = None
    photographer_url: Optional[str] = None


async def search_unsplash(
    query: str,
    per_page: int = 30,
    orientation: Optional[str] = None,
) -> List[UnsplashImage]:
    """
    Search Unsplash for images.

    Args:
        query: Search query
        per_page: Number of results (max 30)
        orientation: "landscape", "portrait", or "squarish"

    Returns:
        List of UnsplashImage objects

    Raises:
        ValueError: If API key not configured
        httpx.HTTPError: If API request fails
    """
    settings = get_unsplash_settings()
    if not settings.unsplash_access_key:
        raise ValueError("Unsplash API key not configured. Set UNSPLASH_ACCESS_KEY in .env")

    logger.info(f"🔍 Searching Unsplash: {query} (limit={per_page})")

    params = {
        "query": query,
        "per_page": min(per_page, 30),
    }
    if orientation:
        params["orientation"] = orientation

    headers = {
        "Authorization": f"Client-ID {settings.unsplash_access_key}",
        "Accept-Version": "v1",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.unsplash.com/search/photos",
            params=params,
            headers=headers,
            timeout=10.0,
        )
        response.raise_for_status()
        data = response.json()

    results = []
    for photo in data.get("results", []):
        results.append(
            UnsplashImage(
                url=photo["urls"]["regular"],
                thumbnail_url=photo["urls"]["small"],
                width=photo["width"],
                height=photo["height"],
                description=photo.get("description") or photo.get("alt_description"),
                photographer=photo["user"]["name"],
                photographer_url=photo["user"]["links"]["html"],
            )
        )

    logger.info(f"✅ Found {len(results)} images")
    return results


async def search_backgrounds(
    style: Optional[str] = None,
    per_page: int = 30,
) -> List[UnsplashImage]:
    """
    Search for background images.

    Args:
        style: Background style (e.g., "marble", "wood", "minimal")
        per_page: Number of results (max 30)

    Returns:
        List of UnsplashImage objects
    """
    query = f"{style} background" if style else "background texture"
    logger.info(f"🎨 Searching backgrounds: {style or 'any'}")

    return await search_unsplash(
        query=query,
        per_page=per_page,
        orientation="landscape",
    )
