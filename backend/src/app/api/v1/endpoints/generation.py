"""
Generation endpoints for listings and images.

Clean endpoints organized by what is being generated.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from src.app.core.logging_config import get_logger
from src.app.services import generation

logger = get_logger("app.api.generation")

router = APIRouter()


# Request/Response Models
class GenerateListingRequest(BaseModel):
    """Request model for listing generation."""
    images: List[str]
    description: str
    listing_type: str


class GenerateListingResponse(BaseModel):
    """Response model for generated listing."""
    title: str
    description: str
    tags: List[str]


class RegenerateFieldRequest(BaseModel):
    """Request model for regenerating a specific field."""
    context: dict  # Contains current title, description, tags


class GenerateImagesRequest(BaseModel):
    """Request model for image generation."""
    description: str
    num_images: int = 4


# Endpoints
@router.post("/listing", response_model=GenerateListingResponse)
async def generate_listing_endpoint(request: GenerateListingRequest):
    """
    Generate listing content (title, description, tags) from images and description.

    Uses Gemini LLM with vision to analyze images and user description.

    Args:
        request: GenerateListingRequest with images, description, listing_type

    Returns:
        GenerateListingResponse with title, description, tags
    """
    try:
        logger.info(f"📝 Generating {request.listing_type} listing")
        result = await generation.generate_listing(
            images=request.images,
            description=request.description,
            listing_type=request.listing_type,
        )
        return GenerateListingResponse(**result)
    except ValueError as e:
        logger.error(f"❌ ValueError: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Exception: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI generation error: {str(e)}")


@router.post("/title")
async def regenerate_title_endpoint(request: RegenerateFieldRequest) -> dict:
    """
    Regenerate only the title field based on context.

    Args:
        request: RegenerateFieldRequest with context (title, description, tags)

    Returns:
        dict with new title string
    """
    try:
        logger.info("🔄 Regenerating title")
        new_title = await generation.regenerate_title(context=request.context)
        return {"title": new_title}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Exception: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/description")
async def regenerate_description_endpoint(request: RegenerateFieldRequest) -> dict:
    """
    Regenerate only the description field based on context.

    Args:
        request: RegenerateFieldRequest with context (title, description, tags)

    Returns:
        dict with new description string
    """
    try:
        logger.info("🔄 Regenerating description")
        new_description = await generation.regenerate_description(context=request.context)
        return {"description": new_description}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Exception: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tags")
async def regenerate_tags_endpoint(request: RegenerateFieldRequest) -> dict:
    """
    Regenerate only the tags field based on context.

    Args:
        request: RegenerateFieldRequest with context (title, description, tags)

    Returns:
        dict with new tags array
    """
    try:
        logger.info("🔄 Regenerating tags")
        new_tags = await generation.regenerate_tags(context=request.context)
        return {"tags": new_tags}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Exception: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/images")
async def generate_images_endpoint(request: GenerateImagesRequest) -> dict:
    """
    Generate images from text description using AI (Gemini Imagen).

    NOT YET IMPLEMENTED - placeholder for future feature.

    Args:
        request: GenerateImagesRequest with description and num_images

    Returns:
        dict with generated image URLs

    Raises:
        HTTPException: 501 Not Implemented
    """
    logger.warning(f"⚠️ Image generation requested but not implemented: {request.description}")
    raise HTTPException(
        status_code=501,
        detail="Image generation with Gemini Imagen is not yet implemented. Use Unsplash search instead."
    )
