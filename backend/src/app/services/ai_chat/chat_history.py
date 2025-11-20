"""
AI Chat History Service - Manages storing and loading conversation history
"""

from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime

from src.models.ai_chat_session import AIChatSession
from src.models.ai_chat_message import AIChatMessage
from src.app.core.logging_config import get_logger

logger = get_logger("app.services.ai_chat.chat_history")


class ChatHistoryService:
    """Service for managing AI chat sessions and message history"""

    @staticmethod
    def create_session(db: Session, user_id: int, title: Optional[str] = None) -> AIChatSession:
        """
        Create a new AI chat session for a user.

        Args:
            db: Database session
            user_id: User ID
            title: Optional session title (auto-generated from first message if not provided)

        Returns:
            Created AIChatSession
        """
        session = AIChatSession(
            user_id=user_id,
            title=title or "New Conversation",
            is_active=True
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        logger.info(f"Created new AI chat session {session.id} for user {user_id}")
        return session

    @staticmethod
    def get_session(db: Session, session_id: int, user_id: int) -> Optional[AIChatSession]:
        """
        Get a specific AI chat session.

        Args:
            db: Database session
            session_id: Session ID
            user_id: User ID (for ownership verification)

        Returns:
            AIChatSession if found and owned by user, None otherwise
        """
        session = db.query(AIChatSession).filter(
            AIChatSession.id == session_id,
            AIChatSession.user_id == user_id
        ).first()
        return session

    @staticmethod
    def get_user_sessions(
        db: Session,
        user_id: int,
        limit: int = 20,
        include_inactive: bool = False
    ) -> List[AIChatSession]:
        """
        Get all AI chat sessions for a user.

        Args:
            db: Database session
            user_id: User ID
            limit: Maximum number of sessions to return
            include_inactive: Whether to include archived sessions

        Returns:
            List of AIChatSession ordered by most recent
        """
        query = db.query(AIChatSession).filter(AIChatSession.user_id == user_id)

        if not include_inactive:
            query = query.filter(AIChatSession.is_active == True)

        sessions = query.order_by(desc(AIChatSession.last_message_at)).limit(limit).all()
        return sessions

    @staticmethod
    def add_message(
        db: Session,
        session_id: int,
        role: str,
        content: str,
        links: Optional[List[Dict[str, str]]] = None
    ) -> AIChatMessage:
        """
        Add a message to an AI chat session.

        Args:
            db: Database session
            session_id: Session ID
            role: Message role ("user" or "assistant")
            content: Message content
            links: Optional links (for assistant responses)

        Returns:
            Created AIChatMessage
        """
        message = AIChatMessage(
            session_id=session_id,
            role=role,
            content=content,
            links=links
        )
        db.add(message)

        # Update session's last_message_at
        session = db.query(AIChatSession).filter(AIChatSession.id == session_id).first()
        if session:
            session.last_message_at = datetime.utcnow()

        db.commit()
        db.refresh(message)
        logger.info(f"Added {role} message to session {session_id}")
        return message

    @staticmethod
    def get_session_messages(
        db: Session,
        session_id: int,
        limit: Optional[int] = None
    ) -> List[AIChatMessage]:
        """
        Get all messages for a session.

        Args:
            db: Database session
            session_id: Session ID
            limit: Optional limit on number of messages (most recent first)

        Returns:
            List of AIChatMessage ordered by creation time
        """
        query = db.query(AIChatMessage).filter(AIChatMessage.session_id == session_id)

        if limit:
            query = query.order_by(desc(AIChatMessage.created_at)).limit(limit)
            messages = query.all()
            messages.reverse()  # Return in chronological order
        else:
            messages = query.order_by(AIChatMessage.created_at).all()

        return messages

    @staticmethod
    def get_conversation_history(
        db: Session,
        session_id: int,
        limit: Optional[int] = None
    ) -> List[Dict[str, str]]:
        """
        Get conversation history in format suitable for Pydantic AI.

        Args:
            db: Database session
            session_id: Session ID
            limit: Optional limit on number of messages

        Returns:
            List of dicts with role and content for Pydantic AI
        """
        messages = ChatHistoryService.get_session_messages(db, session_id, limit)
        return [
            {
                "role": msg.role,
                "content": msg.content
            }
            for msg in messages
        ]

    @staticmethod
    def update_session_title(
        db: Session,
        session_id: int,
        user_id: int,
        title: str
    ) -> Optional[AIChatSession]:
        """
        Update session title (auto-generated from first user message).

        Args:
            db: Database session
            session_id: Session ID
            user_id: User ID (for ownership verification)
            title: New title

        Returns:
            Updated AIChatSession if successful, None otherwise
        """
        session = db.query(AIChatSession).filter(
            AIChatSession.id == session_id,
            AIChatSession.user_id == user_id
        ).first()

        if session:
            session.title = title
            db.commit()
            db.refresh(session)
            logger.info(f"Updated session {session_id} title to: {title}")
            return session

        return None

    @staticmethod
    def generate_session_title(first_user_message: str, max_length: int = 50) -> str:
        """
        Generate a session title from the first user message.

        Args:
            first_user_message: First message from user
            max_length: Maximum title length

        Returns:
            Generated title
        """
        # Clean and truncate
        title = first_user_message.strip()

        if len(title) > max_length:
            title = title[:max_length].rsplit(' ', 1)[0] + '...'

        return title or "New Conversation"

    @staticmethod
    def archive_session(db: Session, session_id: int, user_id: int) -> bool:
        """
        Archive (soft delete) a chat session.

        Args:
            db: Database session
            session_id: Session ID
            user_id: User ID (for ownership verification)

        Returns:
            True if successful, False otherwise
        """
        session = db.query(AIChatSession).filter(
            AIChatSession.id == session_id,
            AIChatSession.user_id == user_id
        ).first()

        if session:
            session.is_active = False
            db.commit()
            logger.info(f"Archived session {session_id}")
            return True

        return False
