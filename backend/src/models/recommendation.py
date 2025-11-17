"""
Recommendation model for AI and user-generated listing matches
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.database import Base


class Recommendation(Base):
    """
    Recommendation table - stores matches between listings.

    Flow:
    1. AI generates recommendations (or user clicks "Make Offer")
    2. Both parties "like" → status becomes "matched" (shown in Matched Listings)
    3. Both parties "checkout" → status becomes "completed" (both listings hidden)
    """

    __tablename__ = "recommendations"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys - which listings are being matched
    source_listing_id = Column(
        Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True
    )  # The listing being viewed

    target_listing_id = Column(
        Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True
    )  # The recommended/matched listing

    # Who initiated this recommendation
    created_by_user_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )  # NULL = AI generated, user_id = user clicked "Make Offer"

    # Recommendation metadata
    recommendation_type = Column(
        String(20), nullable=False, default="ai_match"
    )  # "ai_match" | "user_offer" | "similar"

    match_score = Column(
        Float, nullable=False, default=0.0
    )  # AI confidence score (0-100), 100 for user offers

    match_reasons = Column(
        JSONB, nullable=True, default=list
    )  # ["Similar price range", "Same location", "Matching tags", etc.]

    # Status tracking
    status = Column(
        String(20), nullable=False, default="pending"
    )  # "pending" | "liked_by_source" | "liked_by_target" | "matched" | "checkout_by_source" | "checkout_by_target" | "completed" | "rejected" | "expired"

    # Detailed status explanation:
    # - "pending": Recommendation created, waiting for action
    # - "liked_by_source": Source listing owner liked this match
    # - "liked_by_target": Target listing owner liked this match
    # - "matched": Both parties liked each other (appears in "Matched Listings")
    # - "checkout_by_source": Source listing owner clicked checkout
    # - "checkout_by_target": Target listing owner clicked checkout
    # - "completed": Both parties checked out (both listings hidden from public)
    # - "rejected": One party rejected the match
    # - "expired": Match expired without action

    # Additional notes/message from user when making offer
    message = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    expires_at = Column(DateTime(timezone=True), nullable=True)  # Optional expiration

    # Relationships
    source_listing = relationship("Listing", foreign_keys=[source_listing_id])
    target_listing = relationship("Listing", foreign_keys=[target_listing_id])
    created_by = relationship("User", foreign_keys=[created_by_user_id])

    def __repr__(self):
        return f"<Recommendation(id={self.id}, source={self.source_listing_id}, target={self.target_listing_id}, status='{self.status}')>"
