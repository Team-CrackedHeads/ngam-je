"""Schemas for AI Chat API"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional


class ConversationMessage(BaseModel):
    """A message in the conversation history"""
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class ChatMessageRequest(BaseModel):
    """Request to send a message to the AI assistant"""
    message: str = Field(..., description="User's message to the AI", min_length=1)
    conversation_history: Optional[List[ConversationMessage]] = Field(
        default=None,
        description="Previous conversation messages for context"
    )


class LinkResponse(BaseModel):
    """A clickable link in the response"""
    text: str = Field(..., description="Display text for the link")
    url: str = Field(..., description="URL path (e.g., /threads/123)")


class ChatMessageResponse(BaseModel):
    """Response from the AI assistant"""
    content: str = Field(..., description="AI's response in markdown format")
    links: List[Dict[str, str]] = Field(
        default_factory=list,
        description="Actionable links (threads, listings, FAQs)"
    )


class ChatHistoryItem(BaseModel):
    """A single chat message in the history"""
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: str = Field(..., description="ISO timestamp")
    links: List[Dict[str, str]] = Field(
        default_factory=list,
        description="Links (only for assistant messages)"
    )
