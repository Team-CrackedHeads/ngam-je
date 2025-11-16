"""Thread database model."""

from datetime import datetime, timezone

from sqlalchemy import ARRAY, Column, DateTime, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from src.database import Base


class Thread(Base):
    """Thread/Community model for organizing listings and discussions."""

    __tablename__ = "threads"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)  # Cover image for the thread
    category = Column(String(50), nullable=False, index=True)  # e.g., "gaming", "fashion", "furniture"
    tags = Column(ARRAY(String), nullable=False, default=list)  # Array of tags

    # Tier system (0-3, like Discord boosts)
    tier = Column(Integer, default=0, nullable=False)  # Starts at Tier 0
    contributions = Column(Integer, default=0, nullable=False)  # Total boosts received (all time)
    active_contributions = Column(Integer, default=0, nullable=False)  # Currently active boosts (can decrease)
    boost_expires_at = Column(DateTime(timezone=True), nullable=True)  # When current tier expires

    # Membership tracking
    member_count = Column(Integer, default=0, nullable=False)  # Total members who joined

    # Creator tracking
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships (to be added later when we create thread_members, listings, etc.)
    # creator = relationship("User", back_populates="created_threads")
