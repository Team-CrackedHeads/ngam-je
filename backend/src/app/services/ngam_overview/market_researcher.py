"""
Ngam Overview Market Researcher - PydanticAI-based secondhand market analysis

Purpose: Research secondhand market items and generate comprehensive overviews
- Search web for market data, pricing, and authenticity guides
- Analyze market trends and pricing
- Generate markdown overviews with images and sources
- Provide actionable insights for buyers/sellers
"""

from typing import List, Optional, Dict, Any
import httpx
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.google import GoogleModel
from pydantic_ai.providers.google import GoogleProvider
from serpapi import GoogleSearch

from src.app.core.logging_config import get_logger
from src.app.services.ngam_overview.config import get_ngam_settings

logger = get_logger("app.services.ngam_overview.researcher")


# Output models
class MarketOverview(BaseModel):
    """Complete market overview response"""
    content: str = Field(
        description="Comprehensive markdown-formatted overview (500-1000 words) covering: "
        "authentication tips, pricing insights, market trends, and buying/selling advice"
    )
    key_points: List[str] = Field(
        description="3-5 key takeaways or action items",
        max_length=5
    )
    suggested_price_range: Optional[str] = Field(
        default=None,
        description="Price range in format '$X - $Y' if applicable, otherwise None"
    )


# Dependencies for the agent
class MarketResearchDeps(BaseModel):
    """Dependencies for market research agent"""
    query: str
    search_results: List[Dict[str, Any]]
    settings: Any  # NgamOverviewSettings


# Lazy-initialized agent
_market_research_agent: Optional[Agent] = None


MARKET_RESEARCH_SYSTEM_PROMPT = """You are Ngam, an expert secondhand marketplace analyst. Create SHORT, scannable market overviews for buyers/sellers with short attention spans.

**Content Structure** (250-400 words MAX):

1. **Opening** (1 sentence): Quick intro to the item and current market
2. **Key Authentication Points** (3-4 points max): How to verify authenticity - BRIEF bullet points
3. **Market Pricing** (2-3 sentences): Price range with specific numbers from search results
4. **Quick Tips** (2-3 points): Most important actionable advice
5. **Bottom Line** (1 sentence): TL;DR summary

**Writing Style**:
- ⚡ **Short & punchy** - no fluff, get to the point
- 📊 **Data-focused** - cite specific prices and platforms (StockX, eBay, etc.)
- ✅ **Scannable** - use bullet points, **bold**, and short paragraphs (2-3 lines max)
- 🎯 **Actionable** - every point should be useful

**Keep It SHORT**:
- Opening: 1 sentence
- Each auth point: 5-10 words
- Pricing section: 2-3 sentences with numbers
- Tips: 1 sentence each
- Bottom line: 1 sentence
- **Total: 250-400 words (NOT 500-1000!)**

**Rules**:
- DO use real data from search results
- DO mention specific prices and platforms
- DO NOT write long paragraphs or essays
- DO NOT include unnecessary background info
- If no pricing data: focus on 3-4 key verification tips

**Example (Good - Concise)**:
"The Air Jordan 1 'Chicago' typically resells for $800-$1,500 on StockX.

**Quick Auth Check:**
- **Swoosh**: Clean edges, proper curve
- **Wings Logo**: Crisp embossing, clear text
- **Stitching**: Straight lines, no loose threads

**Market Price:** $800-$1,500 (used), $1,200-$2,000 (deadstock) on StockX/GOAT.

**Quick Tips:**
- Use CheckCheck app ($3) for authentication
- Buy from StockX/GOAT for guaranteed authenticity
- Beware of deals under $700 - likely fake

**Bottom Line:** Expect to pay $1,200+ for authentic deadstock pairs; always verify before buying."

Now create a SHORT market overview from the search results."""


def get_market_research_agent() -> Agent:
    """Get or create market research agent"""
    global _market_research_agent
    if _market_research_agent is None:
        settings = get_ngam_settings()
        provider = GoogleProvider(api_key=settings.gemini_api_key)
        model = GoogleModel(settings.model_name, provider=provider)

        _market_research_agent = Agent(
            model,
            deps_type=MarketResearchDeps,
            output_type=MarketOverview,
            system_prompt=MARKET_RESEARCH_SYSTEM_PROMPT,
        )

    return _market_research_agent


async def search_web(query: str, num_results: int = 10) -> List[Dict[str, Any]]:
    """
    Search the web using SerpAPI.

    Args:
        query: Search query
        num_results: Number of results to fetch

    Returns:
        List of search results with title, link, snippet
    """
    settings = get_ngam_settings()

    if not settings.serpapi_api_key:
        logger.warning("⚠️ SerpAPI key not configured, using mock search results")
        return [{
            "title": f"Mock result for: {query}",
            "link": "https://example.com",
            "snippet": "This is a mock search result. Configure SERPAPI_API_KEY to enable real web search."
        }]

    try:
        logger.info(f"🔍 Searching web for: {query}")

        search = GoogleSearch({
            "q": query,
            "api_key": settings.serpapi_api_key,
            "num": num_results,
        })

        results = search.get_dict()
        organic_results = results.get("organic_results", [])

        # Extract relevant fields
        formatted_results = []
        for result in organic_results:
            formatted_results.append({
                "title": result.get("title", ""),
                "link": result.get("link", ""),
                "snippet": result.get("snippet", ""),
                "position": result.get("position", 0),
            })

        logger.info(f"✅ Found {len(formatted_results)} search results")
        return formatted_results

    except Exception as e:
        logger.error(f"❌ Web search failed: {e}", exc_info=True)
        # Return empty list on error
        return []


async def fetch_images_for_query(query: str, num_images: int = 3) -> List[str]:
    """
    Fetch relevant images using SerpAPI image search.

    Args:
        query: Search query
        num_images: Number of images to fetch (max 3)

    Returns:
        List of image URLs
    """
    settings = get_ngam_settings()

    if not settings.serpapi_api_key:
        logger.warning("⚠️ SerpAPI key not configured, returning empty images")
        return []

    try:
        logger.info(f"🖼️ Fetching images for: {query}")

        search = GoogleSearch({
            "q": query,
            "tbm": "isch",  # Image search
            "api_key": settings.serpapi_api_key,
            "num": num_images,
        })

        results = search.get_dict()
        image_results = results.get("images_results", [])

        # Extract image URLs (prefer original over thumbnail)
        image_urls = []
        for img in image_results[:num_images]:
            url = img.get("original") or img.get("thumbnail")
            if url:
                image_urls.append(url)

        logger.info(f"✅ Found {len(image_urls)} images")
        return image_urls

    except Exception as e:
        logger.error(f"❌ Image search failed: {e}", exc_info=True)
        return []


async def generate_market_overview(
    query: str,
    include_images: bool = True,
    max_results: int = 10
) -> Dict[str, Any]:
    """
    Generate comprehensive market overview using Pydantic AI agent with web search.

    Args:
        query: User's question about secondhand market item
        include_images: Whether to fetch and include images
        max_results: Maximum number of search results to analyze

    Returns:
        dict with:
            - content: Markdown-formatted overview
            - images: List of image URLs (if include_images=True)
            - sources: List of source URLs
            - key_points: List of key takeaways
            - price_range: Suggested price range (if available)

    Raises:
        ValueError: If API keys not configured or generation fails
    """
    settings = get_ngam_settings()

    if not settings.gemini_api_key:
        raise ValueError("Gemini API key not configured. Set GEMINI_API_KEY in .env")

    logger.info(f"📊 Generating market overview for query: '{query}'")

    try:
        # 1. Search the web
        search_results = await search_web(query, num_results=max_results)

        if not search_results:
            raise ValueError("No search results found. Check your SerpAPI configuration.")

        # 2. Extract sources
        sources = [result["link"] for result in search_results[:5]]  # Top 5 sources

        # 3. Prepare agent dependencies
        deps = MarketResearchDeps(
            query=query,
            search_results=search_results,
            settings=settings
        )

        # 4. Build prompt with search results
        search_context = "\n\n".join([
            f"**Result {i+1}**: {result['title']}\n"
            f"Source: {result['link']}\n"
            f"{result['snippet']}"
            for i, result in enumerate(search_results)
        ])

        prompt = f"""User Query: "{query}"

Here are the web search results to analyze:

{search_context}

Based on these search results, generate a comprehensive market overview following the structure and guidelines in your system prompt."""

        # 5. Run agent
        agent = get_market_research_agent()
        result = await agent.run(prompt, deps=deps)

        overview = result.output
        logger.info(f"✅ Generated market overview ({len(overview.content)} chars)")

        # 6. Fetch images (if requested)
        images = []
        if include_images:
            images = await fetch_images_for_query(query, num_images=2)

        # 7. Return complete response
        return {
            "content": overview.content,
            "images": images,
            "sources": sources,
            "key_points": overview.key_points,
            "price_range": overview.suggested_price_range,
        }

    except Exception as e:
        logger.error(f"❌ Failed to generate market overview: {e}", exc_info=True)
        raise ValueError(f"Failed to generate market overview: {str(e)}")


# Follow-up question handler
async def answer_followup_question(
    original_query: str,
    original_overview: str,
    followup_question: str,
    search_results: Optional[List[Dict[str, Any]]] = None
) -> str:
    """
    Answer follow-up questions based on existing overview context.

    Args:
        original_query: Original user query
        original_overview: Previously generated overview
        followup_question: User's follow-up question
        search_results: Optional new search results (will search if not provided)

    Returns:
        Markdown-formatted answer to follow-up question
    """
    settings = get_ngam_settings()

    if not settings.gemini_api_key:
        raise ValueError("Gemini API key not configured")

    logger.info(f"💬 Answering follow-up: '{followup_question}'")

    try:
        # Search if no results provided
        if not search_results:
            combined_query = f"{original_query} {followup_question}"
            search_results = await search_web(combined_query, num_results=5)

        # Use Gemini directly for follow-up (simpler than full agent)
        from google import genai
        client = genai.Client(api_key=settings.gemini_api_key)

        search_context = "\n".join([
            f"- {result['title']}: {result['snippet']}"
            for result in search_results[:3]
        ]) if search_results else "No additional search results available."

        prompt = f"""You are Ngam, a secondhand marketplace expert. Answer the user's follow-up question concisely.

**Original Query**: {original_query}

**Previous Overview** (for context):
{original_overview[:500]}...

**Follow-up Question**: {followup_question}

**Recent Search Results**:
{search_context}

Provide a concise, actionable answer (2-4 sentences) in markdown format. Be specific and cite data when available."""

        response = client.models.generate_content(
            model=settings.model_name,
            contents=prompt
        )

        answer = response.text.strip()
        logger.info(f"✅ Generated follow-up answer ({len(answer)} chars)")

        return answer

    except Exception as e:
        logger.error(f"❌ Failed to answer follow-up: {e}", exc_info=True)
        raise ValueError(f"Failed to answer follow-up question: {str(e)}")
