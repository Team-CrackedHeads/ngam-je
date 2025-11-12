"""
Conversation model for 1-to-1 messaging between matched users
"""
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.database import Base


class Conversation(Base):
    """
    Conversation table - stores 1-to-1 chat sessions between matched users.

    Flow:
    1. Users match via recommendations (status → "matched")
    2. Conversation auto-created with recommendation_id
    3. Users can exchange messages in this conversation
    4. Each recommendation = 1 conversation (tied to specific listing match)
    """
    __tablename__ = "conversations"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign key to recommendation (one conversation per match)
    recommendation_id = Column(
        Integer,
        ForeignKey("recommendations.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,  # One conversation per recommendation
        index=True
    )

    # Status tracking
    is_active = Column(
        Boolean,
        nullable=False,
        default=True
    )  # Can be set to False if conversation is archived/closed

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_message_at = Column(DateTime(timezone=True), nullable=True)  # Updated when new message sent

    # Relationships
    recommendation = relationship("Recommendation", backref="conversation")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")

    def __repr__(self):
        return f"<Conversation(id={self.id}, recommendation_id={self.recommendation_id}, is_active={self.is_active})>"
