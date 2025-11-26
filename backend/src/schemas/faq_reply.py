"""
FAQ Reply schemas for request/response validation
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class FAQReplyBase(BaseModel):
    """Base FAQ Reply schema"""

    text: str = Field(..., min_length=1, max_length=5000, description="The reply text")


class FAQReplyCreate(FAQReplyBase):
    """Schema for creating a new reply"""

    faq_id: int = Field(..., gt=0, description="ID of the FAQ this reply is for")
    parent_reply_id: Optional[int] = Field(
        None, description="ID of parent reply for nested replies"
    )


class FAQReplyUpdate(BaseModel):
    """Schema for updating a reply"""

    text: Optional[str] = Field(None, min_length=1, max_length=5000)
    helpful_count: Optional[int] = Field(None, ge=0)
    not_helpful_count: Optional[int] = Field(None, ge=0)


class FAQReplyResponse(FAQReplyBase):
    """Schema for FAQ Reply response (without nested children)"""

    id: int
    faq_id: int
    parent_reply_id: Optional[int]
    user_id: Optional[int]
    username: str
    helpful_count: int
    not_helpful_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FAQReplyNested(FAQReplyResponse):
    """Schema for nested reply tree structure"""

    replies: List["FAQReplyNested"] = Field(
        default_factory=list, description="Nested child replies"
    )

    class Config:
        from_attributes = True


# Update forward references for recursive model
FAQReplyNested.model_rebuild()
