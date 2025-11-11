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
class RegenerateFieldRequest(BaseModel):
    """Request model for regenerating a specific field."""
    context: dict  # Contains current title, description, tags


class GenerateImagesRequest(BaseModel):
    """Request model for image generation."""
    description: str
    num_images: int = 1  # Default to 1 image to avoid quota issues
    reference_images: List[str] | None = None  # Optional reference images for editing


# Endpoints
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
    Generate images from text description using Gemini 2.5 Flash (nano banana).

    Args:
        request: GenerateImagesRequest with description and num_images

    Returns:
        dict with generated image URLs (base64 data URLs)

    Raises:
        HTTPException: 422 if validation fails, 500 if generation fails
    """
    try:
        mode = "edit" if request.reference_images else "create"
        logger.info(f"🎨 Generating images ({mode}): {request.description[:50]}...")
        image_urls = await generation.generate_images(
            description=request.description,
            num_images=request.num_images,
            reference_images=request.reference_images,
        )
        return {"images": image_urls}
    except ValueError as e:
        logger.error(f"❌ ValueError: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Exception: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Image generation error: {str(e)}")


class PriceIntelligenceRequest(BaseModel):
    """Request model for price intelligence."""
    product_title: str
    product_description: str
    listing_type: str  # "buy" or "sell"
    location: str = "Malaysia"
    use_cache: bool = True


@router.post("/price-intelligence")
async def get_price_intelligence_endpoint(request: PriceIntelligenceRequest) -> dict:
    """
    Get intelligent price recommendations using SerpAPI + Gemini.

    Searches for similar products and analyzes pricing patterns.

    Args:
        request: PriceIntelligenceRequest with product details

    Returns:
        dict with price analysis (min, max, average, recommended range, confidence)

    Raises:
        HTTPException: 422 if validation fails, 500 if analysis fails
    """
    try:
        logger.info(f"💰 Getting price intelligence for: {request.product_title[:50]}... (cache: {request.use_cache})")
        price_data = await generation.get_price_intelligence(
            product_title=request.product_title,
            product_description=request.product_description,
            listing_type=request.listing_type,
            location=request.location,
            use_cache=request.use_cache,
        )
        return price_data
    except ValueError as e:
        logger.error(f"❌ ValueError: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Exception: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Price intelligence error: {str(e)}")


class ProductInfoRequest(BaseModel):
    """Request model for product information lookup."""
    product_name: str


@router.post("/product-info")
async def get_product_info_endpoint(request: ProductInfoRequest) -> dict:
    """
    Search for helpful product information including specs, pros/cons, known issues, and interesting facts.
    This is used by the AI assistant to help users write better listings.

    Args:
        request: ProductInfoRequest with product name

    Returns:
        dict with product information
    """
    try:
        logger.info(f"🔍 Searching for product info: {request.product_name}")
        info = await generation.get_product_information(product_name=request.product_name)
        return {"info": info}
    except Exception as e:
        logger.error(f"❌ Exception: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Product info search error: {str(e)}")
