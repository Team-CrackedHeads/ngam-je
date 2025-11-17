"""
FAQ Reply model for nested replies to FAQ answers
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.database import Base


class FAQReply(Base):
    """FAQ Reply table - stores nested replies to FAQ answers"""

    __tablename__ = "faq_replies"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys
    faq_id = Column(Integer, ForeignKey("faqs.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_reply_id = Column(
        Integer, ForeignKey("faq_replies.id", ondelete="CASCADE"), nullable=True, index=True
    )
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Reply content
    text = Column(Text, nullable=False)
    username = Column(String(100), nullable=False)  # Denormalized for display

    # Engagement metrics
    helpful_count = Column(Integer, nullable=False, default=0)
    not_helpful_count = Column(Integer, nullable=False, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    faq = relationship("FAQ", back_populates="replies")
    user = relationship("User", foreign_keys=[user_id])
    parent_reply = relationship("FAQReply", remote_side=[id], backref="child_replies")

    def __repr__(self):
        return f"<FAQReply(id={self.id}, faq_id={self.faq_id}, text='{self.text[:50]}...')>"
