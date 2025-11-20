"""FAQ Bot Router for handling FAQ-related endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.services.faq_service import FAQService
from src.schemas.faq import FAQRequest, FAQResponse
from typing import Dict, Any

router = APIRouter(tags=["AIAssistant"])

@router.post("/ask")
async def ask_question(payload: FAQRequest, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Ask AI a question about a listing.
    Returns a dict with status, message, data (FAQ object), and optional category.
    """
    service = FAQService(db)
    try:
        result = service.process_question(payload)
        # Service returns: {"status": "found"|"created", "message": str, "data": FAQ, "category": str}
        # Convert SQLAlchemy FAQ model to Pydantic schema for serialization
        if "data" in result and result["data"] is not None:
            result["data"] = FAQResponse.model_validate(result["data"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/{listing_id}")
async def get_summary(listing_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Get AI-generated summary widget for a listing.
    Returns summary, negotiation_score, readiness_tips, and reliability_quote.
    """
    from src.models.listing import Listing
    import logging
    import os

    logger = logging.getLogger(__name__)

    # Check for API key early
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("Google API key not configured")
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured. Please contact support."
        )

    # Check if listing exists first
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        logger.error(f"Listing with ID {listing_id} not found")
        raise HTTPException(status_code=404, detail=f"Listing with ID {listing_id} not found")

    logger.info(f"Generating AI summary for listing {listing_id}")
    service = FAQService(db)

    try:
        result = service.get_widget_data(listing_id)

        # Validate the result structure
        if not isinstance(result, dict):
            logger.error(f"Invalid response from get_widget_data: {type(result)}")
            raise ValueError("Invalid response from AI service")

        # Service returns: {"summary": str, "negotiation_score": int, "readiness_tips": list, "reliability_quote": str}
        # Frontend expects: {"summary": str, "key_features": list, "common_questions": list}
        # Map the backend format to frontend format
        response_data = {
            "summary": result.get("summary", ""),
            "key_features": result.get("readiness_tips", []),  # Map readiness_tips to key_features
            "common_questions": [],  # Not provided by backend currently
            "negotiation_score": result.get("negotiation_score", 0),  # Extra field
            "reliability_quote": result.get("reliability_quote", "")  # Extra field
        }

        logger.info(f"Successfully generated AI summary for listing {listing_id}")
        return response_data

    except TimeoutError as e:
        logger.error(f"Timeout generating summary for listing {listing_id}: {str(e)}")
        raise HTTPException(
            status_code=504,
            detail="AI service request timed out. This may be due to slow network connection. Please try again."
        )
    except ValueError as e:
        logger.error(f"ValueError in get_summary for listing {listing_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in get_summary for listing {listing_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate AI summary. Please try again later."
        )