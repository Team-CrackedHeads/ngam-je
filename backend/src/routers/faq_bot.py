"""FAQ Bot Router for handling FAQ-related endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.services.faq_service import FAQService
from src.schemas.faq import FAQRequest, AIWidgetResponse, FAQResponse

router = APIRouter(tags=["AI Assistant"])

@router.post("/ask", response_model=FAQResponse)
async def ask_question(payload: FAQRequest, db: Session = Depends(get_db)):
    service = FAQService(db)
    try:
        return service.process_question(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/{listing_id}", response_model=AIWidgetResponse)
async def get_summary(listing_id: int, db: Session = Depends(get_db)):
    service = FAQService(db)
    try:
        return service.get_widget_data(listing_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))