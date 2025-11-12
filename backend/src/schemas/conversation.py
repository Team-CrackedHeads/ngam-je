"""
Conversation schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ConversationBase(BaseModel):
    """Base conversation schema with common fields"""
    recommendation_id: int = Field(..., gt=0, description="The recommendation (match) this conversation is about")


class ConversationCreate(ConversationBase):
    """Schema for creating a new conversation"""
    pass


class ConversationUpdate(BaseModel):
    """Schema for updating conversation"""
    is_active: Optional[bool] = Field(None, description="Set to false to archive conversation")


class ConversationResponse(ConversationBase):
    """Schema for conversation response"""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_message_at: Optional[datetime]

    class Config:
        from_attributes = True


class ConversationListResponse(BaseModel):
    """Response for listing conversations"""
    conversations: list[ConversationResponse]
    total: int
