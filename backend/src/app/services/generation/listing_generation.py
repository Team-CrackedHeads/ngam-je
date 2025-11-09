"""
Listing generation service using Gemini LLM.

Functions for generating and regenerating listing content.
"""

import json
import google.generativeai as genai
from typing import List

from src.app.core.logging_config import get_logger
from src.app.services.generation.config import get_ai_settings

logger = get_logger("app.services.generation.listing")


async def generate_listing(
    images: List[str],
    description: str,
    listing_type: str,
) -> dict:
    """
    Generate listing content using Gemini with vision.

    Args:
        images: List of image URLs
        description: User's product description
        listing_type: "buy" or "sell"

    Returns:
        dict with title, description, tags

    Raises:
        ValueError: If API key not configured or generation fails
    """
    settings = get_ai_settings()
    if not settings.gemini_api_key:
        raise ValueError("Gemini API key not configured. Set AI_GEMINI_API_KEY in .env")

    logger.info(f"📝 Generating {listing_type} listing from {len(images)} images")

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(settings.default_model)

    # Build prompt
    prompt = f"""You are a marketplace listing expert. Create an optimized listing for a {listing_type} request.

User's description: {description}
Number of images: {len(images)}

Generate:
1. A catchy, SEO-friendly title (max 80 characters)
2. A detailed, compelling description (200-400 characters)
3. Relevant tags/keywords (5-8 tags)

Respond ONLY with valid JSON (no markdown, no code blocks):
{{"title": "...", "description": "...", "tags": ["tag1", "tag2", ...]}}"""

    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": settings.default_temperature,
                "max_output_tokens": settings.default_max_tokens,
            },
        )

        # Clean and parse response
        text = response.text.strip()
        # Remove markdown code blocks if present
        text = text.replace("```json", "").replace("```", "").strip()

        result = json.loads(text)
        logger.info(f"✅ Generated listing: {result.get('title', 'N/A')[:50]}...")

        return {
            "title": result.get("title", ""),
            "description": result.get("description", ""),
            "tags": result.get("tags", []),
        }
    except json.JSONDecodeError as e:
        logger.error(f"❌ Failed to parse JSON: {e}\nResponse: {response.text}")
        raise ValueError(f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        logger.error(f"❌ Failed to generate listing: {e}", exc_info=True)
        raise ValueError(f"Failed to generate listing: {str(e)}")


async def regenerate_title(context: dict) -> str:
    """
    Regenerate only the title.

    Args:
        context: Current listing data (title, description, tags)

    Returns:
        New title string
    """
    settings = get_ai_settings()
    if not settings.gemini_api_key:
        raise ValueError("Gemini API key not configured")

    logger.info("🔄 Regenerating title")

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(settings.default_model)

    prompt = f"""Generate a catchy, SEO-friendly marketplace listing title (max 80 characters).

Context:
- Current title: {context.get('title', '')}
- Description: {context.get('description', '')}
- Tags: {', '.join(context.get('tags', []))}

Create a DIFFERENT title that's more engaging. Respond with ONLY the new title text, nothing else."""

    try:
        response = model.generate_content(prompt)
        new_title = response.text.strip().strip('"').strip("'")
        logger.info(f"✅ Regenerated title: {new_title[:50]}...")
        return new_title
    except Exception as e:
        logger.error(f"❌ Failed to regenerate title: {e}", exc_info=True)
        raise ValueError(f"Failed to regenerate title: {str(e)}")


async def regenerate_description(context: dict) -> str:
    """
    Regenerate only the description.

    Args:
        context: Current listing data (title, description, tags)

    Returns:
        New description string
    """
    settings = get_ai_settings()
    if not settings.gemini_api_key:
        raise ValueError("Gemini API key not configured")

    logger.info("🔄 Regenerating description")

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(settings.default_model)

    prompt = f"""Generate a detailed, compelling marketplace listing description (200-400 characters).

Context:
- Title: {context.get('title', '')}
- Current description: {context.get('description', '')}
- Tags: {', '.join(context.get('tags', []))}

Create a DIFFERENT description that's more compelling. Respond with ONLY the new description text, nothing else."""

    try:
        response = model.generate_content(prompt)
        new_description = response.text.strip().strip('"').strip("'")
        logger.info(f"✅ Regenerated description")
        return new_description
    except Exception as e:
        logger.error(f"❌ Failed to regenerate description: {e}", exc_info=True)
        raise ValueError(f"Failed to regenerate description: {str(e)}")


async def regenerate_tags(context: dict) -> List[str]:
    """
    Regenerate only the tags.

    Args:
        context: Current listing data (title, description, tags)

    Returns:
        New tags list
    """
    settings = get_ai_settings()
    if not settings.gemini_api_key:
        raise ValueError("Gemini API key not configured")

    logger.info("🔄 Regenerating tags")

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(settings.default_model)

    prompt = f"""Generate 5-8 relevant keywords/tags for this marketplace listing.

Context:
- Title: {context.get('title', '')}
- Description: {context.get('description', '')}

Respond with ONLY a comma-separated list of tags (no numbering, no explanation).
Example: electronics, smartphone, wireless, portable, tech"""

    try:
        response = model.generate_content(prompt)
        tags_str = response.text.strip()
        new_tags = [tag.strip().strip('"').strip("'") for tag in tags_str.split(",")]
        logger.info(f"✅ Regenerated {len(new_tags)} tags")
        return new_tags
    except Exception as e:
        logger.error(f"❌ Failed to regenerate tags: {e}", exc_info=True)
        raise ValueError(f"Failed to regenerate tags: {str(e)}")
