"""Thread Pydantic schemas for API requests and responses."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class ThreadBase(BaseModel):
    """Base thread schema with common fields."""

    title: str = Field(..., min_length=1, max_length=100, description="Thread title")
    description: str = Field(..., min_length=1, description="Thread description")
    image_url: Optional[str] = Field(None, description="Cover image URL")
    category: str = Field(..., min_length=1, max_length=50, description="Thread category (e.g., gaming, fashion)")
    tags: list[str] = Field(default_factory=list, description="Array of tags")


class ThreadCreate(ThreadBase):
    """Schema for creating a new thread."""

    pass


class ThreadUpdate(BaseModel):
    """Schema for updating an existing thread."""

    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1)
    image_url: Optional[str] = None
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    tags: Optional[list[str]] = None


class ThreadResponse(ThreadBase):
    """Schema for thread API responses."""

    id: int
    tier: int = Field(..., description="Thread tier level (0-3)")
    contributions: int = Field(..., description="Number of boosts/contributions")
    member_count: int = Field(..., description="Total members in this thread")
    created_by_user_id: int
    created_at: datetime
    updated_at: datetime

    # Add computed fields for frontend
    online_users: int = Field(default=0, description="Currently online users (computed)")

    class Config:
        from_attributes = True  # Pydantic v2 (was orm_mode in v1)


class ThreadListResponse(BaseModel):
    """Schema for listing multiple threads."""

    threads: list[ThreadResponse]
    total: int
