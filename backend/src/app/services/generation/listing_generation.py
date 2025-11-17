"""
Listing Generator Agent - PydanticAI-based structured generation

Purpose: Transform good descriptions into polished marketplace listings
- Generate SEO-optimized titles
- Create compelling descriptions
- Extract relevant tags
- Understand buy vs sell nuances (e.g., buy = "Looking for X", sell = "Selling Y")
"""

from typing import List, Literal
import base64
import io
from PIL import Image
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.models.google import GoogleModel
from pydantic_ai.providers.google import GoogleProvider
from google import genai
from src.app.core.logging_config import get_logger
from src.app.services.generation.config import get_ai_settings

logger = get_logger("app.services.generation.listing")


# Output models
class GeneratedListing(BaseModel):
    """Complete generated listing"""
    title: str = Field(description="SEO-optimized title (max 80 chars)")
    description: str = Field(description="Compelling description (200-400 chars)")
    tags: List[str] = Field(description="5-8 relevant tags/keywords")


# Context-aware system prompts
BUY_LISTING_PROMPT = """You are a marketplace listing generator helping buyers create "Looking for" posts.

Transform the user's description into a polished buy listing:

**Title Format**: "Looking for [item]" or "WTB: [item with key details]"
- Max 80 characters
- Include key specs if mentioned (e.g., "Looking for iPhone 13 Pro 256GB")
- SEO-friendly and clear

**Description**: 200-400 characters
- Rewrite user's intent in clear, engaging language
- Highlight what they're looking for, why, and any preferences
- Include budget if mentioned
- Professional but friendly tone

**Tags**: 5-8 keywords
- Product category, brand, model, key specs
- Relevant search terms buyers would use

Be concise, specific, and helpful."""

SELL_LISTING_PROMPT = """You are a marketplace listing generator helping sellers create "For Sale" posts.

Transform the seller's description into a polished sell listing:

**Title Format**: "For Sale: [item with key details]" or "[Item] - [condition/key feature]"
- Max 80 characters
- Include model, specs, condition (e.g., "iPhone 13 Pro 256GB - Mint Condition")
- SEO-friendly and attention-grabbing

**Description**: 200-400 characters
- Rewrite product details in clear, compelling language
- Highlight condition, features, and value
- Mention reason for selling if provided
- Build buyer confidence with specifics

**Tags**: 5-8 keywords
- Product category, brand, model, condition
- Relevant search terms buyers would use

Be persuasive, specific, and trustworthy."""


# Lazy-initialized agents (created on first use)
_buy_listing_agent = None
_sell_listing_agent = None


def get_buy_listing_agent() -> Agent:
    """Get or create buy listing agent"""
    global _buy_listing_agent
    if _buy_listing_agent is None:
        settings = get_ai_settings()
        provider = GoogleProvider(api_key=settings.gemini_api_key)
        model = GoogleModel('gemini-2.5-flash', provider=provider)
        _buy_listing_agent = Agent(
            model,
            output_type=GeneratedListing,
            system_prompt=BUY_LISTING_PROMPT,
        )
    return _buy_listing_agent


def get_sell_listing_agent() -> Agent:
    """Get or create sell listing agent"""
    global _sell_listing_agent
    if _sell_listing_agent is None:
        settings = get_ai_settings()
        provider = GoogleProvider(api_key=settings.gemini_api_key)
        model = GoogleModel('gemini-2.5-flash', provider=provider)
        _sell_listing_agent = Agent(
            model,
            output_type=GeneratedListing,
            system_prompt=SELL_LISTING_PROMPT,
        )
    return _sell_listing_agent


async def _generate_from_images(
    images: List[str],
    description: str,
    listing_type: str,
    settings,
) -> dict:
    """
    Generate listing using Gemini Vision to analyze images.

    Args:
        images: List of base64 data URLs
        description: Optional text description
        listing_type: "buy" or "sell"
        settings: AI settings with API key

    Returns:
        dict with title, description, tags
    """
    logger.info(f"🖼️ Using Gemini Vision to analyze {len(images)} image(s)")

    # Initialize Gemini client
    client = genai.Client(api_key=settings.gemini_api_key)

    # Convert images to PIL (handle both data URLs and HTTP URLs)
    pil_images = []
    for idx, img_url in enumerate(images[:3]):  # Analyze up to 3 images
        try:
            if img_url.startswith('http://') or img_url.startswith('https://'):
                # HTTP URL - fetch the image
                import httpx
                async with httpx.AsyncClient() as http_client:
                    response = await http_client.get(img_url, timeout=10.0)
                    response.raise_for_status()
                    img_bytes = response.content
                    pil_image = Image.open(io.BytesIO(img_bytes))
                    pil_images.append(pil_image)
                    logger.info(f"  Fetched & loaded image {idx+1} from URL: {pil_image.size}")
            else:
                # Base64 data URL
                if ',' in img_url:
                    img_data = img_url.split(',', 1)[1]
                else:
                    img_data = img_url

                img_bytes = base64.b64decode(img_data)
                pil_image = Image.open(io.BytesIO(img_bytes))
                pil_images.append(pil_image)
                logger.info(f"  Loaded image {idx+1} from base64: {pil_image.size}")
        except Exception as e:
            logger.warning(f"  Failed to load image {idx+1}: {e}")

    if not pil_images:
        raise ValueError("No valid images could be loaded")

    # Build prompt for vision analysis with proper buy/sell context
    if listing_type == "buy":
        listing_context = """You are creating a "WANT TO BUY" (WTB) listing from a BUYER's perspective.

**Title Format**: "Looking for [item]" or "WTB: [item with key details]"
- Max 80 characters
- MUST use buyer language (e.g., "Looking for", "WTB:", "Seeking")
- Include key specs if mentioned

**Description Format**: Write from BUYER's perspective (200-400 chars)
- Use buyer language: "Looking for...", "Need...", "Interested in..."
- Explain what they want to buy and why
- Mention preferences, condition requirements, budget if provided
- DO NOT write as a seller ("Discover...", "This features...", "Perfect for...")

**Tags**: 5-8 keywords for what the buyer is searching for"""
    else:
        listing_context = """You are creating a "FOR SALE" listing from a SELLER's perspective.

**Title Format**: "For Sale: [item with key details]" or "[Item] - [condition/key feature]"
- Max 80 characters
- Include model, specs, condition
- SEO-friendly and attention-grabbing

**Description Format**: Write from SELLER's perspective (200-400 chars)
- Highlight product features, condition, and value
- Use seller language: "Selling...", "This item features...", "Perfect for..."
- Build buyer confidence with specifics

**Tags**: 5-8 keywords for search optimization"""

    if description and len(description.strip()) > 0:
        # Has description - use both images and text
        vision_prompt = f"""{listing_context}

Analyze the provided images and combine with the user's description to generate a marketplace listing.

User's description:
"{description}"

Examine the images to identify additional details like:
- Brand, model, color, size
- Condition and quality
- Materials and construction
- Any unique features

Generate a complete listing with title, description (200-400 chars), and 5-8 tags.
Format as JSON: {{"title": "...", "description": "...", "tags": ["tag1", "tag2", ...]}}"""
    else:
        # No description - rely entirely on image analysis
        vision_prompt = f"""{listing_context}

Analyze these product images and generate a complete marketplace listing.

Carefully examine the images to identify:
1. What the product is (type, category)
2. Brand, model, and specifications (if visible)
3. Color, size, materials
4. Condition (new, used, excellent, etc.)
5. Notable features or details

Generate:
- Title: SEO-optimized, max 80 chars
- Description: Compelling description, 200-400 chars
- Tags: 5-8 relevant keywords

Format as JSON: {{"title": "...", "description": "...", "tags": ["tag1", "tag2", ...]}}"""

    # Call Gemini Vision
    contents = [vision_prompt] + pil_images
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents
    )

    response_text = response.text.strip()
    logger.info(f"  Vision response: {response_text[:100]}...")

    # Parse JSON response
    import json
    # Extract JSON from response (handle markdown code blocks)
    if "```json" in response_text:
        json_str = response_text.split("```json")[1].split("```")[0].strip()
    elif "```" in response_text:
        json_str = response_text.split("```")[1].split("```")[0].strip()
    else:
        json_str = response_text

    try:
        parsed = json.loads(json_str)
        return {
            "title": parsed.get("title", ""),
            "description": parsed.get("description", ""),
            "tags": parsed.get("tags", []),
        }
    except json.JSONDecodeError as e:
        logger.error(f"  Failed to parse JSON: {e}")
        logger.error(f"  Raw response: {response_text}")
        raise ValueError(f"Failed to parse AI response as JSON: {e}")


async def generate_listing(
    images: List[str],
    description: str,
    listing_type: str,
) -> dict:
    """
    Generate complete listing (title, description, tags) from images and/or description.

    Args:
        images: List of image URLs (data URLs or http URLs) - analyzed using vision
        description: User's freeform description (optional)
        listing_type: "buy" or "sell"

    Returns:
        dict with title, description, tags

    Raises:
        ValueError: If API key not configured or generation fails
    """
    settings = get_ai_settings()
    if not settings.gemini_api_key:
        raise ValueError("Gemini API key not configured. Set AI_GEMINI_API_KEY in .env")

    logger.info(f"📝 Generating {listing_type} listing from {len(images)} images and description ({len(description)} chars)")

    try:
        # If we have images, use Gemini Vision directly for better image analysis
        if images and len(images) > 0:
            return await _generate_from_images(images, description, listing_type, settings)

        # No images - use PydanticAI agent for text-only generation
        agent = get_buy_listing_agent() if listing_type == "buy" else get_sell_listing_agent()

        prompt = f"""Generate a polished marketplace listing from this user description:

"{description}"

Listing type: {listing_type}

Create a complete listing with title, description, and tags."""

        result = await agent.run(prompt)
        logger.info(f"✅ Generated listing: {result.output.title[:50]}...")

        return {
            "title": result.output.title,
            "description": result.output.description,
            "tags": result.output.tags,
        }

    except Exception as e:
        logger.error(f"❌ Failed to generate listing: {e}", exc_info=True)
        raise ValueError(f"Failed to generate listing: {str(e)}")


# Single-field regeneration agents (lazy-initialized)
_regenerate_title_agent = None
_regenerate_description_agent = None
_regenerate_tags_agent = None


class TagList(BaseModel):
    """List of tags"""
    tags: List[str] = Field(description="5-8 relevant keywords/tags")


def get_regenerate_title_agent() -> Agent:
    """Get or create regenerate title agent"""
    global _regenerate_title_agent
    if _regenerate_title_agent is None:
        settings = get_ai_settings()
        provider = GoogleProvider(api_key=settings.gemini_api_key)
        model = GoogleModel('gemini-2.5-flash', provider=provider)
        _regenerate_title_agent = Agent(
            model,
            output_type=str,
            system_prompt="Generate a catchy, SEO-friendly marketplace listing title (max 80 characters). Respond with ONLY the title text.",
        )
    return _regenerate_title_agent


def get_regenerate_description_agent() -> Agent:
    """Get or create regenerate description agent"""
    global _regenerate_description_agent
    if _regenerate_description_agent is None:
        settings = get_ai_settings()
        provider = GoogleProvider(api_key=settings.gemini_api_key)
        model = GoogleModel('gemini-2.5-flash', provider=provider)
        _regenerate_description_agent = Agent(
            model,
            output_type=str,
            system_prompt="Generate a detailed, compelling marketplace listing description (200-400 characters). Respond with ONLY the description text.",
        )
    return _regenerate_description_agent


def get_regenerate_tags_agent() -> Agent:
    """Get or create regenerate tags agent"""
    global _regenerate_tags_agent
    if _regenerate_tags_agent is None:
        settings = get_ai_settings()
        provider = GoogleProvider(api_key=settings.gemini_api_key)
        model = GoogleModel('gemini-2.5-flash', provider=provider)
        _regenerate_tags_agent = Agent(
            model,
            output_type=TagList,
            system_prompt="Generate 5-8 relevant keywords/tags for a marketplace listing.",
        )
    return _regenerate_tags_agent


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

    try:
        prompt = f"""Current listing context:
- Title: {context.get('title', '')}
- Description: {context.get('description', '')}
- Tags: {', '.join(context.get('tags', []))}

Create a DIFFERENT, more engaging title."""

        agent = get_regenerate_title_agent()
        result = await agent.run(prompt)
        new_title = result.output.strip()
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

    try:
        prompt = f"""Current listing context:
- Title: {context.get('title', '')}
- Description: {context.get('description', '')}
- Tags: {', '.join(context.get('tags', []))}

Create a DIFFERENT, more compelling description."""

        agent = get_regenerate_description_agent()
        result = await agent.run(prompt)
        new_description = result.output.strip()
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

    try:
        prompt = f"""Current listing context:
- Title: {context.get('title', '')}
- Description: {context.get('description', '')}
- Current tags: {', '.join(context.get('tags', []))}

Generate DIFFERENT, more relevant tags."""

        agent = get_regenerate_tags_agent()
        result = await agent.run(prompt)
        new_tags = result.output.tags
        logger.info(f"✅ Regenerated {len(new_tags)} tags")
        return new_tags

    except Exception as e:
        logger.error(f"❌ Failed to regenerate tags: {e}", exc_info=True)
        raise ValueError(f"Failed to regenerate tags: {str(e)}")
