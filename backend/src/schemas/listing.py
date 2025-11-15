"""Listing Pydantic schemas for API requests and responses."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# FAQ item for listing creation (simple version - just question/answer pairs)
class FAQItem(BaseModel):
    """FAQ item for listing creation."""
    id: str  # Frontend generates IDs
    question: str
    answer: str


class ListingBase(BaseModel):
    """Base listing schema with common fields (matches frontend form fields)."""

    title: str = Field(..., min_length=1, max_length=255, description="Listing title (from generatedTitle)")
    description: str = Field(..., min_length=1, description="Listing description (from generatedDescription)")
    price: float = Field(..., gt=0, description="Display price")
    min_price: Optional[float] = Field(None, gt=0, description="Minimum price (from minPrice field)")
    max_price: Optional[float] = Field(None, gt=0, description="Maximum price (from maxPrice field)")
    currency: str = Field(default="MYR", min_length=3, max_length=3, description="Currency code (from currency field)")
    listing_type: str = Field(..., description="Type: 'sale' (WTS/sell) or 'wanted' (WTB/buy)")
    image_url: Optional[str] = Field(None, description="Main image URL (first image)")
    gallery: Optional[list[str]] = Field(default_factory=list, description="Additional image URLs")
    tags: Optional[list[str]] = Field(default_factory=list, description="Tags (from tags field)")
    protected: bool = Field(default=False, description="Whether listing is protected (premium)")
    creator_location: Optional[str] = Field(None, max_length=255, description="Creator location (from location field)")
    shipping_options: Optional[list[str]] = Field(default_factory=list, description="Shipping methods (from shippingOptions field)")
    inventory_quantity: Optional[int] = Field(None, gt=0, description="Inventory (from inventoryQuantity field, sell only)")
    ownership_proof_url: Optional[str] = Field(None, description="Proof of ownership image (from ownershipProofImage, sell only)")
    faqs: Optional[list[FAQItem]] = Field(default_factory=list, description="FAQs to create with the listing")


class ListingCreate(ListingBase):
    """Schema for creating a new listing."""

    thread_id: int = Field(..., description="ID of the thread this listing belongs to")


class ListingUpdate(BaseModel):
    """Schema for updating an existing listing (all fields optional)."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    price: Optional[float] = Field(None, gt=0)
    min_price: Optional[float] = Field(None, gt=0)
    max_price: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    listing_type: Optional[str] = None
    image_url: Optional[str] = None
    gallery: Optional[list[str]] = None
    tags: Optional[list[str]] = None
    protected: Optional[bool] = None
    creator_location: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None
    is_matched: Optional[bool] = None
    shipping_options: Optional[list[str]] = None
    inventory_quantity: Optional[int] = Field(None, gt=0)
    ownership_proof_url: Optional[str] = None
    # FAQs removed - use FAQ endpoints instead


class CheckoutConfirm(BaseModel):
    """Schema for confirming a checkout/deal."""

    recommendation_id: int = Field(..., description="ID of the recommendation/match")
    transaction_method: str = Field(..., description="Transaction method chosen (in-person, platform-logistics, etc.)")
    delivery_address: Optional[str] = Field(None, description="Delivery address if applicable")
    payment_method: Optional[str] = Field(None, description="Payment method chosen")


class ListingResponse(ListingBase):
    """Schema for listing API responses."""

    id: int
    user_id: int
    thread_id: int
    views: int
    creator_name: Optional[str] = None
    creator_verified: bool
    is_active: bool
    is_matched: bool
    is_checked_out: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2 (was orm_mode in v1)


class ListingListResponse(BaseModel):
    """Schema for listing multiple listings."""

    listings: list[ListingResponse]
    total: int
