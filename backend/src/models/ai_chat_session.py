"""
AI Chat Session model for storing conversation history with Ngam AI assistant
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.database import Base


class AIChatSession(Base):
    """
    AI Chat Session table - stores conversation sessions with the AI assistant.

    Each session represents a continuous conversation between a user and the AI.
    Sessions can be resumed and viewed in history.
    """
    __tablename__ = "ai_chat_sessions"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign key to user
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Session metadata
    title = Column(
        String(255),
        nullable=True
    )  # Auto-generated from first user message (e.g., "iPhone 14 Pro price comparison")

    # Status
    is_active = Column(
        Boolean,
        nullable=False,
        default=True
    )  # Can archive old sessions

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_message_at = Column(DateTime(timezone=True), nullable=True, index=True)  # For sorting by recency

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    messages = relationship("AIChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="AIChatMessage.created_at")

    def __repr__(self):
        return f"<AIChatSession(id={self.id}, user_id={self.user_id}, title='{self.title}', is_active={self.is_active})>"
