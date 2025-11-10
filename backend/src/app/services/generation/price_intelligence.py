"""
Price intelligence service using SerpAPI + Gemini LLM.

Searches for similar products and analyzes pricing patterns.
"""

import json
import google.generativeai as genai
from serpapi import GoogleSearch
from cachetools import TTLCache
from typing import Dict, List, Optional

from src.app.core.logging_config import get_logger
from src.app.services.generation.config import get_ai_settings

logger = get_logger("app.services.generation.price_intelligence")

# Cache price results for 24 hours (key: product_query, value: price_data)
price_cache = TTLCache(maxsize=1000, ttl=86400)  # 24 hours


async def search_similar_products(product_query: str, location: str = "Malaysia") -> List[Dict]:
    """
    Search for similar products using SerpAPI Google Shopping.

    Args:
        product_query: Product description/title
        location: Geographic location for search

    Returns:
        List of product results with prices
    """
    settings = get_ai_settings()

    if not settings.serpapi_api_key:
        logger.warning("SerpAPI key not configured, returning empty results")
        return []

    try:
        logger.info(f"🔍 Searching for: {product_query[:50]}...")

        search = GoogleSearch({
            "q": product_query,
            "location": location,
            "hl": "en",
            "gl": "my",
            "google_domain": "google.com.my",
            "api_key": settings.serpapi_api_key,
            "engine": "google_shopping",
            "num": 20,  # Get up to 20 results
        })

        results = search.get_dict()
        shopping_results = results.get("shopping_results", [])

        logger.info(f"✅ Found {len(shopping_results)} shopping results")

        # Extract relevant price data
        products = []
        for item in shopping_results:
            try:
                # Extract price (handle different formats)
                price_str = item.get("price", "")
                extracted_price = item.get("extracted_price")

                if extracted_price:
                    products.append({
                        "title": item.get("title", ""),
                        "price": float(extracted_price),
                        "currency": item.get("currency", "MYR"),
                        "source": item.get("source", ""),
                        "link": item.get("link", ""),
                    })
            except (ValueError, TypeError) as e:
                logger.debug(f"Skipping item due to price parsing error: {e}")
                continue

        return products

    except Exception as e:
        logger.error(f"❌ SerpAPI search failed: {e}", exc_info=True)
        return []


async def analyze_prices_with_ai(
    products: List[Dict],
    product_description: str,
    listing_type: str,
) -> Dict:
    """
    Analyze product prices based on actual market data.

    Args:
        products: List of similar products with prices
        product_description: User's product description
        listing_type: "buy" or "sell"

    Returns:
        Price analysis with min (0th percentile), max (100th percentile),
        average, and insights from AI
    """
    settings = get_ai_settings()

    if not products:
        logger.warning("No products to analyze, returning default range")
        return {
            "min": 0,
            "max": 0,
            "average": 0,
            "recommended_min": 0,
            "recommended_max": 0,
            "confidence": "low",
            "sample_size": 0,
            "insights": "Unable to find similar products for price comparison",
        }

    # Calculate statistics from actual data
    prices = sorted([p["price"] for p in products])

    min_price = min(prices)  # 0th percentile
    max_price = max(prices)  # 100th percentile
    average_price = sum(prices) / len(prices)

    # Get AI insights about the pricing (not for calculating prices, just context)
    insights = "Based on current market data analysis"
    confidence = "high" if len(products) >= 10 else "medium" if len(products) >= 5 else "low"

    if settings.gemini_api_key:
        try:
            price_list = ", ".join([f"{p['title']}: {p['currency']} {p['price']}" for p in products[:10]])

            genai.configure(api_key=settings.gemini_api_key)
            model = genai.GenerativeModel(settings.default_model)

            prompt = f"""Analyze these market prices for similar products and provide brief insights.

Product: {product_description}
Listing Type: {listing_type}
Sample Prices: {price_list}
Price Range: ${min_price:.2f} - ${max_price:.2f}
Average: ${average_price:.2f}

Provide a brief (1-2 sentences) insight about pricing factors, market trends, or recommendations.
Respond with ONLY the insight text, no JSON or formatting."""

            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.3,
                    "max_output_tokens": 200,
                },
            )

            insights = response.text.strip().strip('"').strip("'")
            logger.info(f"✅ Got AI insights for pricing")

        except Exception as e:
            logger.warning(f"⚠️ Failed to get AI insights: {e}")
            # Continue with default insights

    logger.info(f"✅ Price analysis: {average_price:.2f} (range: {min_price:.2f}-{max_price:.2f})")

    return {
        "min": round(min_price, 2),
        "max": round(max_price, 2),
        "average": round(average_price, 2),
        "recommended_min": round(min_price, 2),  # 0th percentile
        "recommended_max": round(max_price, 2),  # 100th percentile
        "confidence": confidence,
        "sample_size": len(products),
        "insights": insights,
    }


def generate_price_history(average_price: float, num_months: int = 6) -> List[Dict]:
    """
    Generate simulated price history based on current average.

    Creates a realistic-looking trend showing slight variations over time.
    """
    from datetime import datetime, timedelta
    import random

    if average_price <= 0:
        return []

    history = []
    today = datetime.now()

    # Month names for formatting
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    # Generate slightly declining trend (simulating depreciation)
    for i in range(num_months, 0, -1):
        date = today - timedelta(days=30 * i)
        # Add ±5-15% variation around average, with slight upward trend to current price
        variation = random.uniform(-0.10, 0.05)
        # Older prices tend to be slightly higher (depreciation)
        time_factor = (i / num_months) * 0.15
        price = average_price * (1 + variation + time_factor)

        history.append({
            "month": month_names[date.month - 1],
            "year": date.year,
            "price": round(price, 2),
        })

    # Add current price point
    history.append({
        "month": month_names[today.month - 1],
        "year": today.year,
        "price": round(average_price, 2),
    })

    return history


async def get_price_intelligence(
    product_title: str,
    product_description: str,
    listing_type: str,
    location: str = "Malaysia",
    use_cache: bool = True,
) -> Dict:
    """
    Get intelligent price recommendations for a product.

    Args:
        product_title: Product title/name
        product_description: Detailed description
        listing_type: "buy" or "sell"
        location: Geographic location
        use_cache: Whether to use cached results

    Returns:
        Price intelligence data with recommendations and price history
    """
    # Create cache key
    cache_key = f"{product_title}_{listing_type}_{location}".lower()

    # Check cache
    if use_cache and cache_key in price_cache:
        logger.info(f"💾 Using cached price data for: {product_title[:50]}...")
        return price_cache[cache_key]

    # Search for similar products
    search_query = f"{product_title} {product_description}"[:200]  # Limit query length
    products = await search_similar_products(search_query, location)

    if not products:
        logger.warning("No products found, returning default range")
        result = {
            "min": 0,
            "max": 0,
            "average": 0,
            "recommended_min": 0,
            "recommended_max": 0,
            "confidence": "low",
            "sample_size": 0,
            "insights": "Unable to find similar products for price comparison",
            "currency": "MYR",
            "price_history": [],
        }
        price_cache[cache_key] = result
        return result

    # Analyze with AI
    analysis = await analyze_prices_with_ai(
        products=products,
        product_description=f"{product_title}. {product_description}",
        listing_type=listing_type,
    )

    # Add currency
    analysis["currency"] = products[0]["currency"] if products else "MYR"

    # Generate simulated price history
    analysis["price_history"] = generate_price_history(analysis.get("average", 0))

    # Cache result
    price_cache[cache_key] = analysis

    return analysis
