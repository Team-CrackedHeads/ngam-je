"""
Image generation service using Gemini 2.5 Flash (nano banana).

Generates images from text descriptions using Google's Gemini 2.5 Flash model.
Supports both text-to-image and text-and-image-to-image generation.
"""

import base64
from typing import List, Optional
from google import genai
from PIL import Image
import io

from src.app.core.logging_config import get_logger
from src.app.services.generation.config import get_ai_settings

logger = get_logger("app.services.generation.images")


async def generate_images(
    description: str,
    num_images: int = 1,
    reference_images: Optional[List[str]] = None,
) -> List[str]:
    """
    Generate images from text description using Gemini 2.5 Flash.

    Supports two modes:
    1. Text-to-Image: Generate images from text description only
    2. Text-and-Image-to-Image: Edit/enhance existing images based on text description

    Args:
        description: Text description of images to generate or edit
        num_images: Number of images to generate (1-4)
        reference_images: Optional list of base64 image URLs to use as reference for editing

    Returns:
        List of base64-encoded image data URLs

    Raises:
        ValueError: If API key not configured or generation fails
    """
    settings = get_ai_settings()
    if not settings.gemini_api_key:
        raise ValueError("Gemini API key not configured. Set AI_GEMINI_API_KEY in .env")

    # Validate num_images
    if num_images < 1 or num_images > 4:
        logger.warning(f"Invalid num_images: {num_images}, clamping to 1-4")
        num_images = max(1, min(4, num_images))

    mode = "text-and-image-to-image" if reference_images else "text-to-image"
    logger.info(f"🎨 Generating {num_images} images ({mode}) from: {description[:50]}...")

    try:
        # Initialize the new SDK client
        client = genai.Client(api_key=settings.gemini_api_key)

        # Convert reference images from base64 to PIL Images if provided
        pil_images = []
        if reference_images:
            for img_data_url in reference_images:
                # Remove data URL prefix if present
                if ',' in img_data_url:
                    img_data = img_data_url.split(',', 1)[1]
                else:
                    img_data = img_data_url

                # Decode base64 to PIL Image
                img_bytes = base64.b64decode(img_data)
                pil_image = Image.open(io.BytesIO(img_bytes))
                pil_images.append(pil_image)
                logger.info(f"  Loaded reference image: {pil_image.size}")

        # Generate multiple images by calling the model multiple times
        image_urls = []
        for i in range(num_images):
            logger.info(f"  Generating image {i+1}/{num_images}...")

            # Build contents based on mode
            if pil_images:
                # Text-and-Image-to-Image: Include both prompt and reference images
                contents = [description] + pil_images
            else:
                # Text-to-Image: Just the prompt
                contents = [description]

            # Generate image using new SDK
            response = client.models.generate_content(
                model="gemini-2.5-flash-image",
                contents=contents
            )

            # Extract image from response (new SDK style)
            image_found = False
            for part in response.parts:
                if part.inline_data is not None:
                    # Get the raw image bytes directly from inline_data
                    image_data = part.inline_data.data

                    # Convert raw bytes to PIL Image, then back to base64
                    pil_image = Image.open(io.BytesIO(image_data))

                    # Convert PIL image to base64 data URL
                    buffered = io.BytesIO()
                    pil_image.save(buffered, format="PNG")
                    image_bytes = buffered.getvalue()
                    base64_str = base64.b64encode(image_bytes).decode('utf-8')
                    data_url = f"data:image/png;base64,{base64_str}"

                    image_urls.append(data_url)
                    image_found = True
                    logger.info(f"  ✅ Image {i+1} generated successfully")
                    break

            # Check if generation was blocked
            if not image_found:
                logger.warning(f"No image data in response for image {i+1}")
                logger.debug(f"Response: {response}")
                raise ValueError(f"Model did not return image data (possibly blocked by safety filters)")

        logger.info(f"✅ Generated {len(image_urls)} images successfully")
        return image_urls

    except Exception as e:
        logger.error(f"❌ Failed to generate images: {e}", exc_info=True)
        raise ValueError(f"Failed to generate images: {str(e)}")
