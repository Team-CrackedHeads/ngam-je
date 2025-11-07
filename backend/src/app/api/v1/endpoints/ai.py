"""
AI endpoints for product search and analysis.

This module provides RESTful API endpoints for AI-powered product search,
following clean architecture principles with proper separation of concerns.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from src.app.services.ai.agents import ProductSearchAgent

router = APIRouter()

# Request/Response Models
class ProductRequest(BaseModel):
    """Request model for product queries."""
    product_name: str


class ProductDetailsResponse(BaseModel):
    """Response model for product details."""
    title: str
    description: str
    tags: List[str]
    images: List[str]


class ProductPricesResponse(BaseModel):
    """Response model for product prices."""
    price_history: List[float]
    max_price: float
    min_price: float
    avg_price: float


# Endpoints
@router.post("/product_details", response_model=ProductDetailsResponse)
async def get_product_details(request: ProductRequest):
    """
    Get detailed information about a product using AI.

    This endpoint uses an AI agent to search the web and gather:
    - Product title
    - Detailed description (up to 1,000 characters)
    - Product tags/keywords (up to 10)
    - Product images (up to 5 URLs)

    Args:
        request: ProductRequest containing the product name

    Returns:
        ProductDetailsResponse with product information

    Raises:
        HTTPException: If the AI agent fails to generate valid response
    """
    try:
        agent = ProductSearchAgent()
        result = await agent.get_product_details(request.product_name)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI agent error: {str(e)}")


@router.post("/product_prices", response_model=ProductPricesResponse)
async def get_product_prices(request: ProductRequest):
    """
    Get price information and history for a product using AI.

    This endpoint uses an AI agent to analyze market prices and provide:
    - Price history (up to 180 days)
    - Maximum price
    - Minimum price
    - Average price

    Args:
        request: ProductRequest containing the product name

    Returns:
        ProductPricesResponse with price information

    Raises:
        HTTPException: If the AI agent fails to generate valid response
    """
    try:
        agent = ProductSearchAgent()
        result = await agent.get_product_prices(request.product_name)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI agent error: {str(e)}")
