"""
Recommendation schemas for request/response validation
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class RecommendationBase(BaseModel):
    """Base recommendation schema with common fields"""

    source_listing_id: int = Field(..., gt=0, description="The listing being viewed/matched from")
    target_listing_id: int = Field(..., gt=0, description="The recommended/matched listing")


class RecommendationCreate(RecommendationBase):
    """Schema for creating a new recommendation"""

    recommendation_type: str = Field(
        default="ai_match", description="Type of recommendation: ai_match, user_offer, similar"
    )
    match_score: float = Field(
        default=0.0, ge=0, le=100, description="Match confidence score (0-100)"
    )
    match_reasons: Optional[list[str]] = Field(default=None, description="Reasons for the match")
    message: Optional[str] = Field(
        default=None, max_length=1000, description="Optional message from user"
    )


class RecommendationUpdate(BaseModel):
    """Schema for updating recommendation status"""

    status: Optional[str] = Field(
        None,
        description="Status: pending, liked_by_source, liked_by_target, matched, checkout_by_source, checkout_by_target, completed, rejected, expired",
    )
    match_score: Optional[float] = Field(None, ge=0, le=100, description="Updated match score")
    match_reasons: Optional[list[str]] = Field(None, description="Updated match reasons")


class RecommendationResponse(RecommendationBase):
    """Schema for recommendation response"""

    id: int
    created_by_user_id: Optional[int]
    recommendation_type: str
    match_score: float
    match_reasons: Optional[list[str]]
    status: str
    message: Optional[str]
    created_at: datetime
    updated_at: datetime
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True


class RecommendationListResponse(BaseModel):
    """Response for listing recommendations"""

    recommendations: list[RecommendationResponse]
    total: int


class RecommendationWithListingDetails(RecommendationResponse):
    """
    Extended response that includes full listing details.
    Useful for frontend to display matched listings without extra API calls.
    """

    source_listing: Optional[dict] = Field(None, description="Source listing details")
    target_listing: Optional[dict] = Field(None, description="Target listing details")

    class Config:
        from_attributes = True
