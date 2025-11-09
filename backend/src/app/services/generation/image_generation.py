"""
Image generation service using Gemini Imagen.

NOT YET IMPLEMENTED - Placeholder for future image generation.
"""

from typing import List

from src.app.core.logging_config import get_logger

logger = get_logger("app.services.generation.images")


async def generate_images(
    description: str,
    num_images: int = 4,
) -> List[str]:
    """
    Generate images from text description using Gemini Imagen.

    Args:
        description: Text description of images to generate
        num_images: Number of images to generate

    Returns:
        List of generated image URLs

    Raises:
        NotImplementedError: This feature is not yet implemented
    """
    logger.warning(f"⚠️ Image generation requested but not implemented: {description}")
    raise NotImplementedError(
        "Image generation with Gemini Imagen is not yet implemented. "
        "Use /unsplash/search for real product images instead."
    )
