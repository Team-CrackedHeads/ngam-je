"""Message API endpoints for user messaging."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from src.app.api.deps import get_current_user
from src.database import get_db
from src.models.user import User
from src.models.message import Message
from src.models.conversation import Conversation
from src.models.recommendation import Recommendation
from src.schemas.message import (
    MessageCreate,
    MessageUpdate,
    MessageResponse,
    MessageListResponse,
)

router = APIRouter()


@router.get("/conversation/{conversation_id}", response_model=MessageListResponse)
async def get_conversation_messages(
    conversation_id: int,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all messages in a conversation.

    Returns messages ordered by created_at (oldest first for chat display).
    Supports pagination with limit/offset.
    """
    # Verify conversation exists and user has access
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation {conversation_id} not found",
        )

    # Verify user is part of this conversation
    recommendation = conversation.recommendation
    user_listings = (
        db.query(Recommendation)
        .filter(
            Recommendation.id == recommendation.id,
            (
                (Recommendation.source_listing.has(user_id=current_user.id))
                | (Recommendation.target_listing.has(user_id=current_user.id))
            ),
        )
        .first()
    )

    if not user_listings:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this conversation",
        )

    # Query messages
    query = db.query(Message).filter(Message.conversation_id == conversation_id)

    # Get total count
    total = query.count()

    # Count unread messages for current user (messages sent by others that are unread)
    unread_count = query.filter(
        Message.sender_id != current_user.id, ~Message.is_read
    ).count()

    # Get paginated messages (oldest first)
    messages = query.order_by(Message.created_at.asc()).offset(offset).limit(limit).all()

    return MessageListResponse(messages=messages, total=total, unread_count=unread_count)


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Send a new message in a conversation.

    Automatically updates the conversation's last_message_at timestamp.
    """
    # Verify conversation exists and user has access
    conversation = (
        db.query(Conversation).filter(Conversation.id == message_in.conversation_id).first()
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation {message_in.conversation_id} not found",
        )

    # Verify user is part of this conversation
    recommendation = conversation.recommendation
    user_listings = (
        db.query(Recommendation)
        .filter(
            Recommendation.id == recommendation.id,
            (
                (Recommendation.source_listing.has(user_id=current_user.id))
                | (Recommendation.target_listing.has(user_id=current_user.id))
            ),
        )
        .first()
    )

    if not user_listings:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to send messages in this conversation",
        )

    # Check if conversation is active
    if not conversation.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot send messages to an archived conversation",
        )

    # Create message
    message = Message(
        conversation_id=message_in.conversation_id,
        sender_id=current_user.id,
        content=message_in.content,
        message_type=message_in.message_type,
        is_read=False,
    )

    db.add(message)

    # Update conversation's last_message_at
    conversation.last_message_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(message)

    return message


@router.patch("/{message_id}", response_model=MessageResponse)
async def update_message(
    message_id: int,
    message_in: MessageUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update a message (typically to mark it as read).

    Users can only mark messages sent TO them as read.
    """
    message = db.query(Message).filter(Message.id == message_id).first()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Message {message_id} not found",
        )

    # Verify user has access to this conversation
    conversation = message.conversation
    recommendation = conversation.recommendation

    user_listings = (
        db.query(Recommendation)
        .filter(
            Recommendation.id == recommendation.id,
            (
                (Recommendation.source_listing.has(user_id=current_user.id))
                | (Recommendation.target_listing.has(user_id=current_user.id))
            ),
        )
        .first()
    )

    if not user_listings:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this message",
        )

    # Users can only mark messages sent TO them as read
    if message.sender_id == current_user.id and message_in.is_read is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot mark your own messages as read/unread",
        )

    # Update fields
    if message_in.is_read is not None:
        message.is_read = message_in.is_read
        if message_in.is_read:
            message.read_at = datetime.now(timezone.utc)
        else:
            message.read_at = None

    db.commit()
    db.refresh(message)

    return message


@router.post(
    "/conversation/{conversation_id}/mark-all-read", status_code=status.HTTP_204_NO_CONTENT
)
async def mark_all_messages_read(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mark all messages in a conversation as read for the current user.

    Only marks messages sent BY others (not the user's own messages).
    """
    # Verify conversation exists and user has access
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation {conversation_id} not found",
        )

    # Verify user is part of this conversation
    recommendation = conversation.recommendation
    user_listings = (
        db.query(Recommendation)
        .filter(
            Recommendation.id == recommendation.id,
            (
                (Recommendation.source_listing.has(user_id=current_user.id))
                | (Recommendation.target_listing.has(user_id=current_user.id))
            ),
        )
        .first()
    )

    if not user_listings:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this conversation",
        )

    # Mark all unread messages (sent by others) as read
    now = datetime.now(timezone.utc)

    db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.sender_id != current_user.id,
        ~Message.is_read,
    ).update({"is_read": True, "read_at": now})

    db.commit()

    return None
