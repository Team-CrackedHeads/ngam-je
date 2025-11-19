"""FAQ Bot Router for handling FAQ-related endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.services.faq_service import FAQService
from src.schemas.faq import FAQRequest
from typing import Dict, Any

router = APIRouter(tags=["AI Assistant"])

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
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/{listing_id}")
async def get_summary(listing_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Get AI-generated summary widget for a listing.
    Returns summary, negotiation_score, readiness_tips, and reliability_quote.
    """
    service = FAQService(db)
    try:
        result = service.get_widget_data(listing_id)
        # Service returns: {"summary": str, "negotiation_score": int, "readiness_tips": list, "reliability_quote": str}
        # Frontend expects: {"summary": str, "key_features": list, "common_questions": list}
        # Map the backend format to frontend format
        return {
            "summary": result.get("summary", ""),
            "key_features": result.get("readiness_tips", []),  # Map readiness_tips to key_features
            "common_questions": [],  # Not provided by backend currently
            "negotiation_score": result.get("negotiation_score", 0),  # Extra field
            "reliability_quote": result.get("reliability_quote", "")  # Extra field
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
