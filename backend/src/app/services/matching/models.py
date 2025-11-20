"""
Pydantic models for AI negotiation
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class NegotiationMessage(BaseModel):
    """Single message in negotiation"""

    role: str  # "buyer" or "seller"
    message: str
    turn: int
    timestamp: datetime


class NegotiationResult(BaseModel):
    """Result of AI-to-AI negotiation"""

    agreed: bool
    final_price: Optional[float] = None
    termination_reason: str
    conversation: list[NegotiationMessage]
    conversation_summary: str
    turn_count: int
    duration_seconds: float
    match_score: float = Field(ge=0, le=100)  # 0-100 score


class MatchCandidate(BaseModel):
    """A potential match between listings"""

    listing_id: int
    score: float
    reasons: list[str]
