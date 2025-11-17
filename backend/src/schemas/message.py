"""
Message schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MessageBase(BaseModel):
    """Base message schema with common fields"""
    content: str = Field(..., min_length=1, max_length=5000, description="Message text content")


class MessageCreate(MessageBase):
    """Schema for creating a new message"""
    conversation_id: int = Field(..., gt=0, description="The conversation this message belongs to")
    message_type: str = Field(default="text", description="Message type: text, system, image")


class MessageUpdate(BaseModel):
    """Schema for updating message (e.g., marking as read)"""
    is_read: Optional[bool] = Field(None, description="Mark message as read/unread")


class MessageResponse(MessageBase):
    """Schema for message response"""
    id: int
    conversation_id: int
    sender_id: Optional[int]
    message_type: str
    is_read: bool
    read_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    """Response for listing messages"""
    messages: list[MessageResponse]
    total: int
    unread_count: int = Field(default=0, description="Number of unread messages")
