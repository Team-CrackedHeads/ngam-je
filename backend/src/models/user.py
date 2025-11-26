"""User database model."""

from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String

from src.database import Base


class User(Base):
    """User database model - Clerk managed authentication."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    clerk_user_id = Column(
        String, unique=True, index=True, nullable=False
    )  # Clerk user ID (primary auth)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    # No hashed_password - Clerk manages all authentication
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)

    # Profile statistics - will be calculated from related services
    rating = Column(Float, default=0.0, nullable=False)  # Average rating from reviews
    rating_count = Column(Integer, default=0, nullable=False)  # Total number of reviews
    total_listings = Column(Integer, default=0, nullable=False)  # Total active listings
    completed_deals = Column(
        Integer, default=0, nullable=False
    )  # Successfully completed transactions

    # KYC Verification (Didit)
    kyc_status = Column(
        String, default="pending", nullable=False
    )  # pending, in_progress, verified, failed
    kyc_session_id = Column(String, nullable=True)  # Didit session ID (for API calls)
    kyc_session_token = Column(String, nullable=True)  # Didit session token (for verification URL)
    kyc_initiated_at = Column(DateTime(timezone=True), nullable=True)  # When KYC was started
    kyc_verified_at = Column(DateTime(timezone=True), nullable=True)  # When KYC was completed

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
