"""
FAQ schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FAQBase(BaseModel):
    """Base FAQ schema with common fields"""
    question: str = Field(..., min_length=5, max_length=1000, description="The question text")


class FAQQuestionCreate(FAQBase):
    """Schema for creating a new question"""
    listing_id: int = Field(..., gt=0, description="ID of the listing this question is for")


class FAQAnswerCreate(BaseModel):
    """Schema for answering a question"""
    answer: str = Field(..., min_length=1, max_length=5000, description="The answer text")


class FAQUpdate(BaseModel):
    """Schema for updating FAQ (e.g., marking as accepted)"""
    is_accepted: Optional[bool] = Field(None, description="Mark answer as accepted/best answer")
    helpful_count: Optional[int] = Field(None, ge=0, description="Number of helpful votes")
    not_helpful_count: Optional[int] = Field(None, ge=0, description="Number of not helpful votes")


class FAQResponse(FAQBase):
    """Schema for FAQ response"""
    id: int
    listing_id: int
    question_user_id: Optional[int]
    answer_user_id: Optional[int]
    question_username: Optional[str]
    answer: Optional[str]
    answer_username: Optional[str]
    is_answered: bool
    is_accepted: bool
    helpful_count: int
    not_helpful_count: int
    created_at: datetime
    updated_at: datetime
    answered_at: Optional[datetime]

    class Config:
        from_attributes = True


class FAQListResponse(BaseModel):
    """Response for listing FAQs"""
    faqs: list[FAQResponse]
    total: int
