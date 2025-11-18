"""
Schemas for FAQ-related requests and responses.
"""
from pydantic import BaseModel
from typing import List, Optional, Any

class FAQRequest(BaseModel):
    listing_id: int
    user_id: int
    question: str

class AIWidgetResponse(BaseModel):
    summary: str
    negotiation_score: int
    readiness_tips: List[str]
    reliability_quote: str

class FAQResponse(BaseModel):
    status: str
    message: str
    data: Any = None # Returns the FAQ object
    category: Optional[str] = None