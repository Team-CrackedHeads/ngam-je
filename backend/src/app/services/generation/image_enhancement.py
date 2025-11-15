"""
Image Enhancement Service using Gemini 2.5 Flash (nano banana).

Combines product images with background images to create enhanced product photos.
Uses text-and-image-to-image generation to merge products with new backgrounds.
"""

import base64
import io
from typing import List
from google import genai
from PIL import Image

from src.app.core.logging_config import get_logger
from src.app.services.generation.config import get_ai_settings

logger = get_logger("app.services.generation.image_enhancement")


async def enhance_product_image(
    product_image_url: str,
    background_image_url: str,
    enhancement_instructions: str | None = None,
) -> str:
    """
    Enhance a product image by combining it with a new background.

    Uses Gemini 2.5 Flash (nano banana) to intelligently merge the product
    with a new background while preserving product details and quality.

    Args:
        product_image_url: Base64-encoded product image data URL
        background_image_url: Base64-encoded background image data URL (or regular URL)
        enhancement_instructions: Optional custom instructions for the enhancement

    Returns:
        Base64-encoded enhanced image data URL

    Raises:
        ValueError: If API key not configured or enhancement fails
    """
    settings = get_ai_settings()
    if not settings.gemini_api_key:
        raise ValueError("Gemini API key not configured. Set AI_GEMINI_API_KEY in .env")

    logger.info("🎨 Enhancing product image with new background")

    try:
        # Initialize Gemini client
        client = genai.Client(api_key=settings.gemini_api_key)

        # Convert product image from base64 to PIL Image
        if ',' in product_image_url:
            product_data = product_image_url.split(',', 1)[1]
        else:
            product_data = product_image_url

        product_bytes = base64.b64decode(product_data)
        product_pil = Image.open(io.BytesIO(product_bytes))
        logger.info(f"  Loaded product image: {product_pil.size}")

        # Convert background image from base64 to PIL Image
        if background_image_url.startswith('http'):
            # If it's a URL, fetch it
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.get(background_image_url) as response:
                    if response.status != 200:
                        raise ValueError(f"Failed to fetch background image: HTTP {response.status}")
                    background_bytes = await response.read()
        else:
            # It's a base64 data URL
            if ',' in background_image_url:
                background_data = background_image_url.split(',', 1)[1]
            else:
                background_data = background_image_url
            background_bytes = base64.b64decode(background_data)

        background_pil = Image.open(io.BytesIO(background_bytes))
        logger.info(f"  Loaded background image: {background_pil.size}")

        # Construct enhancement prompt
        default_instructions = """Create a professional product photo by combining the product from the first image with the background from the second image.

Requirements:
1. Extract the product from the first image (remove its original background)
2. Place the product naturally on the background from the second image
3. Ensure proper lighting and shadows to make it look realistic
4. Maintain the product's original quality, colors, and details
5. Make the composition visually appealing and professional
6. Ensure the product is the focal point

The result should look like a professional product photography shot."""

        prompt = enhancement_instructions or default_instructions

        logger.info("  Generating enhanced image...")

        # Call Gemini with both images (text-and-image-to-image mode)
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[prompt, product_pil, background_pil]
        )

        # Extract enhanced image from response
        enhanced_image_url = None
        for part in response.parts:
            if part.inline_data is not None:
                # Get the raw image bytes
                image_data = part.inline_data.data

                # Convert to PIL Image, then to base64
                enhanced_pil = Image.open(io.BytesIO(image_data))

                # Convert to base64 data URL
                buffered = io.BytesIO()
                enhanced_pil.save(buffered, format="PNG")
                image_bytes = buffered.getvalue()
                base64_str = base64.b64encode(image_bytes).decode('utf-8')
                enhanced_image_url = f"data:image/png;base64,{base64_str}"

                logger.info(f"  ✅ Enhanced image generated: {enhanced_pil.size}")
                break

        if not enhanced_image_url:
            logger.warning("No image data in response")
            logger.debug(f"Response: {response}")
            raise ValueError("Model did not return enhanced image (possibly blocked by safety filters)")

        return enhanced_image_url

    except Exception as e:
        logger.error(f"❌ Failed to enhance image: {e}", exc_info=True)
        raise ValueError(f"Failed to enhance image: {str(e)}")


async def batch_enhance_images(
    product_image_urls: List[str],
    background_image_urls: List[str],
    enhancement_instructions: str | None = None,
) -> List[str]:
    """
    Enhance multiple product images with multiple backgrounds.

    Creates enhanced versions by combining each product with each background.
    Limited to avoid quota issues.

    Args:
        product_image_urls: List of base64-encoded product image data URLs (max 2)
        background_image_urls: List of base64-encoded background image data URLs (max 3)
        enhancement_instructions: Optional custom instructions for the enhancement

    Returns:
        List of base64-encoded enhanced image data URLs

    Raises:
        ValueError: If limits exceeded or enhancement fails
    """
    # Limit inputs to avoid quota issues
    if len(product_image_urls) > 2:
        raise ValueError("Maximum 2 product images allowed for batch enhancement")
    if len(background_image_urls) > 3:
        raise ValueError("Maximum 3 background images allowed for batch enhancement")

    logger.info(f"🎨 Batch enhancing {len(product_image_urls)} products with {len(background_image_urls)} backgrounds")

    enhanced_images = []

    # Generate all combinations (product x background)
    for i, product_url in enumerate(product_image_urls):
        for j, background_url in enumerate(background_image_urls):
            logger.info(f"  Enhancing product {i+1} with background {j+1}")
            try:
                enhanced = await enhance_product_image(
                    product_image_url=product_url,
                    background_image_url=background_url,
                    enhancement_instructions=enhancement_instructions,
                )
                enhanced_images.append(enhanced)
            except Exception as e:
                logger.error(f"  ❌ Failed to enhance product {i+1} with background {j+1}: {e}")
                # Continue with other combinations even if one fails

    logger.info(f"✅ Batch enhancement complete: {len(enhanced_images)}/{len(product_image_urls) * len(background_image_urls)} successful")
    return enhanced_images
