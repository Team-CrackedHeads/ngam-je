"""Product information lookup service using web search and AI."""

import google.generativeai as genai
from serpapi import GoogleSearch
from src.app.core.logging_config import get_logger
from .config import get_ai_settings

logger = get_logger("app.services.product_info")


async def search_product_reviews(product_name: str) -> list[dict]:
    """
    Search for product reviews and information using SerpAPI.

    Args:
        product_name: Product to search for

    Returns:
        List of search results with titles, snippets, and links
    """
    settings = get_ai_settings()

    if not settings.serpapi_api_key:
        logger.warning("SerpAPI key not configured")
        return []

    try:
        # Search for product reviews, specs, and issues
        search_query = f"{product_name} review specs pros cons issues"

        search = GoogleSearch({
            "q": search_query,
            "api_key": settings.serpapi_api_key,
            "engine": "google",
            "num": 10,  # Get top 10 results
        })

        results = search.get_dict()
        organic_results = results.get("organic_results", [])

        logger.info(f"✅ Found {len(organic_results)} search results for {product_name}")

        # Extract relevant info
        search_results = []
        for item in organic_results:
            search_results.append({
                "title": item.get("title", ""),
                "snippet": item.get("snippet", ""),
                "link": item.get("link", ""),
            })

        return search_results

    except Exception as e:
        logger.error(f"❌ SerpAPI search failed: {e}")
        return []


async def get_product_information(product_name: str) -> str:
    """
    Search for and summarize helpful product information.

    Finds specs, pros/cons, known issues, and interesting facts about a product
    to help users write better buy listings.

    Args:
        product_name: The product to search for (e.g., "Samsung Galaxy Note 7", "Nike Air Max 90")

    Returns:
        Formatted string with product information including:
        - Key specs/features
        - Pros and cons
        - Known issues or recalls
        - Interesting facts
        - Things to look for when buying
    """
    try:
        settings = get_ai_settings()

        logger.info(f"🔍 Searching for product info: {product_name}")

        # Step 1: Search the web for product information
        search_results = await search_product_reviews(product_name)

        if not search_results:
            logger.warning(f"⚠️ No search results found for: {product_name}")
            return f"I couldn't find specific information about {product_name}. You can still describe what features, condition, and details you're looking for!"

        # Step 2: Use Gemini to analyze and summarize the search results
        model = genai.GenerativeModel(
            model_name=settings.default_model,
        )

        # Prepare context from search results
        search_context = "\n\n".join([
            f"**{result['title']}**\n{result['snippet']}"
            for result in search_results[:5]  # Use top 5 results
        ])

        prompt = f"""Based on the following web search results about "{product_name}", provide a helpful summary for someone looking to BUY this product.

SEARCH RESULTS:
{search_context}

Analyze the above information and provide:
1. **Key Specs/Features**: What makes this product notable
2. **Pros**: Main advantages and selling points
3. **Cons**: Common issues or drawbacks
4. **Known Issues**: Any recalls, defects, or problems to be aware of (like Galaxy Note 7 battery issues)
5. **Buying Tips**: What to look for, check, or ask about when buying used/new

Format your response with markdown headers and bullet points for readability.
Keep it concise but informative - aim for 150-200 words total.
Be factual and base your response on the search results provided."""

        response = await model.generate_content_async(prompt)

        if response and response.text:
            logger.info(f"✅ Found product info for: {product_name}")
            return response.text
        else:
            logger.warning(f"⚠️ No product info found for: {product_name}")
            return f"I couldn't find specific information about {product_name}. You can still describe what features, condition, and details you're looking for!"

    except Exception as e:
        logger.error(f"❌ Error searching for product info: {e}", exc_info=True)
        return f"I had trouble searching for information. Please describe what specific features and condition you're looking for in {product_name}."
