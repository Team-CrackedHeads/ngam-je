"""Ngam Overview API endpoints."""

from fastapi import APIRouter, HTTPException, status
from src.app.core.logging_config import get_logger
from src.schemas.ngam_overview import (
    NgamOverviewRequest,
    NgamOverviewResponse,
    FollowUpRequest,
    FollowUpResponse,
)
from src.app.services.ngam_overview.market_researcher import (
    generate_market_overview,
    answer_followup_question,
)

logger = get_logger("app.api.ngam_overview")

router = APIRouter()


@router.post("/generate", response_model=NgamOverviewResponse, status_code=status.HTTP_200_OK)
async def generate_overview(request: NgamOverviewRequest):
    """
    Generate comprehensive market overview for secondhand items.

    This endpoint uses Pydantic AI to:
    1. Search the web for market data using SerpAPI
    2. Analyze pricing, authenticity, and market trends
    3. Generate structured markdown overview with images and sources

    **Example queries**:
    - "How do I verify if Air Jordan 1 Chicago sneakers are authentic?"
    - "What's the market value of iPhone 13 Pro 256GB?"
    - "Best practices for selling vintage Rolex watches"
    """
    try:
        logger.info(f"📊 Generating overview for query: '{request.query}'")

        # Generate overview using Pydantic AI agent
        result = await generate_market_overview(
            query=request.query,
            include_images=request.include_images,
            max_results=request.max_results,
        )

        return NgamOverviewResponse(
            content=result["content"],
            images=result.get("images", []),
            sources=result.get("sources", []),
            key_points=result.get("key_points", []),
            price_range=result.get("price_range"),
        )

    except ValueError as e:
        logger.error(f"❌ Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"❌ Failed to generate overview: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate market overview. Please try again."
        )


@router.post("/followup", response_model=FollowUpResponse, status_code=status.HTTP_200_OK)
async def answer_followup(request: FollowUpRequest):
    """
    Answer follow-up questions based on existing overview.

    This allows users to ask additional questions like:
    - "What's the typical price range?"
    - "How can I verify authenticity?"
    - "Common defects to check?"
    """
    try:
        logger.info(f"💬 Answering follow-up: '{request.followup_question}'")

        answer = await answer_followup_question(
            original_query=request.original_query,
            original_overview=request.original_content,
            followup_question=request.followup_question,
        )

        return FollowUpResponse(answer=answer)

    except ValueError as e:
        logger.error(f"❌ Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"❌ Failed to answer follow-up: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to answer follow-up question. Please try again."
        )
