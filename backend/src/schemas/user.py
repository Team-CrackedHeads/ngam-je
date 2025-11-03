from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema with common fields - Clerk managed."""

    email: EmailStr
    username: str
    is_active: bool = True
    is_superuser: bool = False


class UserUpdate(BaseModel):
    """Schema for updating an existing user."""

    username: str | None = None
    is_active: bool | None = None


class User(UserBase):
    """Schema for user in API responses."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    clerk_user_id: str
    # Profile statistics
    rating: float
    rating_count: int
    total_listings: int
    completed_deals: int
    # KYC verification
    kyc_status: str
    kyc_session_id: str | None
    kyc_initiated_at: datetime | None
    kyc_verified_at: datetime | None
    created_at: datetime
    updated_at: datetime
