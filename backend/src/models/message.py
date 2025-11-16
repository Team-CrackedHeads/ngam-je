"""
Message model for chat messages within conversations
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.database import Base


class Message(Base):
    """
    Message table - stores individual messages within conversations.

    Flow:
    1. User sends message in a conversation
    2. Message stored with sender_id, content, and timestamps
    3. Other user can see message in real-time (or on page refresh)
    """
    __tablename__ = "messages"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys
    conversation_id = Column(
        Integer,
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    sender_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,  # SET NULL if user deleted, but preserve message
        index=True
    )

    # Message content
    content = Column(Text, nullable=False)

    # Message metadata
    message_type = Column(
        String(20),
        nullable=False,
        default="text"
    )  # "text" | "system" (e.g., "User liked your item") | "image" (future)

    # Read tracking
    is_read = Column(Boolean, nullable=False, default=False, index=True)
    read_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])

    def __repr__(self):
        return f"<Message(id={self.id}, conversation_id={self.conversation_id}, sender_id={self.sender_id}, content='{self.content[:50]}...')>"
