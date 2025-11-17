"""Listing database model."""

from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from src.database import Base


class Listing(Base):
    """Listing model for marketplace items (for sale or wanted)."""

    __tablename__ = "listings"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys - REQUIRED
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    thread_id = Column(Integer, ForeignKey("threads.id"), nullable=False, index=True)

    # Basic info (matches frontend form fields)
    title = Column(String(255), nullable=False)  # From generatedTitle
    description = Column(Text, nullable=False)  # From generatedDescription

    # Pricing (matches frontend form fields)
    price = Column(Float, nullable=False)  # Display price
    min_price = Column(Float, nullable=True)  # From minPrice field
    max_price = Column(Float, nullable=True)  # From maxPrice field
    currency = Column(String(3), nullable=False, default="MYR")  # From currency field

    # Listing type
    listing_type = Column(
        String(20), nullable=False, index=True
    )  # "sale" (WTS/sell) or "wanted" (WTB/buy)

    # Media (matches frontend form fields)
    image_url = Column(Text, nullable=True)  # Main image (first image from form)
    gallery = Column(JSONB, nullable=True, default=list)  # Additional images

    # Metadata (matches frontend form fields)
    tags = Column(JSONB, nullable=True, default=list)  # From tags field
    views = Column(Integer, nullable=False, default=0)  # Track views
    protected = Column(Boolean, nullable=False, default=False)  # Premium feature

    # Creator/Poster info (person who created the listing, whether buying or selling)
    creator_name = Column(String(100), nullable=True)  # From current_user.username
    creator_location = Column(String(100), nullable=True)  # From location field
    creator_verified = Column(Boolean, nullable=False, default=False)  # From KYC or ownershipProofImage

    # Shipping (matches frontend form fields)
    shipping_options = Column(JSONB, nullable=True, default=list)  # From shippingOptions field

    # Inventory (for sell listings, matches frontend form)
    inventory_quantity = Column(Integer, nullable=True)  # From inventoryQuantity field (sell only)

    # Proof of ownership (for sell listings, matches frontend form)
    ownership_proof_url = Column(Text, nullable=True)  # From ownershipProofImage field (sell only)

    # FAQs are now in a separate table (see FAQ model and relationship below)

    # Status flags
    is_active = Column(Boolean, nullable=False, default=True)
    is_matched = Column(Boolean, nullable=False, default=False)  # For matched WTB/WTS pairs
    is_checked_out = Column(Boolean, nullable=False, default=False)  # For completed checkout deals

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    # creator = relationship("User", back_populates="listings")
    # thread = relationship("Thread", back_populates="listings")
    faq_questions = relationship("FAQ", back_populates="listing", cascade="all, delete-orphan")
