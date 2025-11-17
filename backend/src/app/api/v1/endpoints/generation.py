"""
Generation endpoints for listings and images.

Clean endpoints organized by what is being generated.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Literal

from src.app.core.logging_config import get_logger
from src.app.services import generation
from src.app.services import listing_evaluation

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
    num_images: int = 1  # Default to 1 image to avoid quota issues
    reference_images: List[str] | None = None  # Optional reference images for editing


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


class EvaluateDescriptionRequest(BaseModel):
    """Request model for description evaluation."""
    text: str
    listing_type: Literal["buy", "sell"] = "buy"


@router.post("/evaluate-description")
async def evaluate_description_endpoint(request: EvaluateDescriptionRequest) -> dict:
    """
    Evaluate listing description quality with hybrid rule-based + AI approach.

    Returns checklist, score, and suggestions.

    Args:
        request: EvaluateDescriptionRequest with text and listing_type

    Returns:
        dict with score, checklist, suggestions, suggested_title, suggested_tags
    """
    try:
        logger.info(f"📝 Evaluating description ({len(request.text)} chars)")
        result = await listing_evaluation.evaluate_listing_description(
            text=request.text,
            listing_type=request.listing_type,
        )
        return result
    except ValueError as e:
        logger.error(f"❌ ValueError: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Exception: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Evaluation error: {str(e)}")


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


class VerifyOwnershipRequest(BaseModel):
    """Request model for ownership verification."""
    image_data_url: str
    expected_username: str | None = None


@router.post("/verify-ownership")
async def verify_ownership_endpoint(request: VerifyOwnershipRequest) -> dict:
    """
    Verify proof of ownership using Gemini OCR.

    Checks if the image contains:
    - User's name/username
    - Current date (within 7 days)
    - Clear, readable text

    Args:
        request: VerifyOwnershipRequest with image and optional username

    Returns:
        dict with verification result (is_verified, detected_name, detected_date, confidence, issues, suggestions)

    Raises:
        HTTPException: 422 if validation fails, 500 if verification fails
    """
    try:
        logger.info(f"🔍 Verifying ownership proof")
        result = await generation.verify_ownership_proof(
            image_data_url=request.image_data_url,
            expected_username=request.expected_username,
        )
        return result
    except ValueError as e:
        logger.error(f"❌ ValueError: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Exception: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Ownership verification error: {str(e)}")


class EnhanceImageRequest(BaseModel):
    """Request model for image enhancement."""
    product_image_url: str
    background_image_url: str
    enhancement_instructions: str | None = None


@router.post("/enhance-image")
async def enhance_image_endpoint(request: EnhanceImageRequest) -> dict:
    """
    Enhance a product image by combining it with a new background.

    Uses Gemini 2.5 Flash (nano banana) to intelligently merge the product
    with a new background while preserving product details.

    Args:
        request: EnhanceImageRequest with product image, background image, and optional instructions

    Returns:
        dict with enhanced image URL (base64 data URL)

    Raises:
        HTTPException: 422 if validation fails, 500 if enhancement fails
    """
    try:
        logger.info("🎨 Enhancing product image")
        enhanced_image_url = await generation.enhance_product_image(
            product_image_url=request.product_image_url,
            background_image_url=request.background_image_url,
            enhancement_instructions=request.enhancement_instructions,
        )
        return {"enhanced_image": enhanced_image_url}
    except ValueError as e:
        logger.error(f"❌ ValueError: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Exception: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Image enhancement error: {str(e)}")


class BatchEnhanceImagesRequest(BaseModel):
    """Request model for batch image enhancement."""
    product_image_urls: List[str]
    background_image_urls: List[str]
    enhancement_instructions: str | None = None


@router.post("/batch-enhance-images")
async def batch_enhance_images_endpoint(request: BatchEnhanceImagesRequest) -> dict:
    """
    Enhance multiple product images with multiple backgrounds.

    Creates enhanced versions by combining each product with each background.

    Args:
        request: BatchEnhanceImagesRequest with product images, background images, and optional instructions

    Returns:
        dict with list of enhanced image URLs

    Raises:
        HTTPException: 422 if validation fails or limits exceeded, 500 if enhancement fails
    """
    try:
        logger.info(f"🎨 Batch enhancing {len(request.product_image_urls)} products with {len(request.background_image_urls)} backgrounds")
        enhanced_images = await generation.batch_enhance_images(
            product_image_urls=request.product_image_urls,
            background_image_urls=request.background_image_urls,
            enhancement_instructions=request.enhancement_instructions,
        )
        return {"enhanced_images": enhanced_images}
    except ValueError as e:
        logger.error(f"❌ ValueError: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Exception: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch image enhancement error: {str(e)}")
