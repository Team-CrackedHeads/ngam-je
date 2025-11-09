"""
FAQ model for listing questions and answers
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.database import Base


class FAQ(Base):
    """FAQ table - stores questions and answers for listings"""
    __tablename__ = "faqs"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    question_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    answer_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    # Question info
    question = Column(Text, nullable=False)
    question_username = Column(String(100), nullable=True)  # Denormalized for display

    # Answer info
    answer = Column(Text, nullable=True)  # NULL if unanswered
    answer_username = Column(String(100), nullable=True)  # Denormalized for display
    is_answered = Column(Boolean, nullable=False, default=False, index=True)
    is_accepted = Column(Boolean, nullable=False, default=False)  # Seller can mark best answer

    # Engagement metrics
    helpful_count = Column(Integer, nullable=False, default=0)  # Upvotes
    not_helpful_count = Column(Integer, nullable=False, default=0)  # Downvotes

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    answered_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    listing = relationship("Listing", back_populates="faq_questions")
    question_user = relationship("User", foreign_keys=[question_user_id])
    answer_user = relationship("User", foreign_keys=[answer_user_id])
    replies = relationship("FAQReply", back_populates="faq", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<FAQ(id={self.id}, listing_id={self.listing_id}, question='{self.question[:50]}...')>"
