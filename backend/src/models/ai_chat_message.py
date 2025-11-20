"""
AI Chat Message model for storing individual messages in AI chat sessions
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.database import Base


class AIChatMessage(Base):
    """
    AI Chat Message table - stores individual messages within AI chat sessions.

    Stores both user messages and AI responses with full context and links.
    """
    __tablename__ = "ai_chat_messages"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign key to session
    session_id = Column(
        Integer,
        ForeignKey("ai_chat_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Message role
    role = Column(
        String(20),
        nullable=False
    )  # "user" or "assistant"

    # Message content
    content = Column(Text, nullable=False)

    # AI response metadata
    links = Column(
        JSON,
        nullable=True
    )  # Store links provided by AI (e.g., [{"text": "View Listing", "url": "/threads/1/listings/2"}])

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationships
    session = relationship("AIChatSession", back_populates="messages")

    def __repr__(self):
        return f"<AIChatMessage(id={self.id}, session_id={self.session_id}, role='{self.role}', content='{self.content[:50]}...')>"
