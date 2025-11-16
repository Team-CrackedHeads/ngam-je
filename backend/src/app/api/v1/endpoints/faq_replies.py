"""FAQ Reply endpoints for nested replies to FAQ answers."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from src.database import get_db
from src.models.user import User
from src.models.faq import FAQ
from src.models.faq_reply import FAQReply
from src.schemas.faq_reply import (
    FAQReplyCreate,
    FAQReplyUpdate,
    FAQReplyResponse,
    FAQReplyNested,
)
from src.app.api.deps import get_current_user

router = APIRouter()


def build_reply_tree(replies: List[FAQReply]) -> List[FAQReplyNested]:
    """Build a nested tree structure from flat list of replies"""
    reply_dict = {}
    root_replies = []

    # First pass: create all reply objects
    for reply in replies:
        reply_nested = FAQReplyNested(
            id=reply.id,
            faq_id=reply.faq_id,
            parent_reply_id=reply.parent_reply_id,
            user_id=reply.user_id,
            username=reply.username,
            text=reply.text,
            helpful_count=reply.helpful_count,
            not_helpful_count=reply.not_helpful_count,
            created_at=reply.created_at,
            updated_at=reply.updated_at,
            replies=[],
        )
        reply_dict[reply.id] = reply_nested

        # Collect root-level replies (no parent)
        if reply.parent_reply_id is None:
            root_replies.append(reply_nested)

    # Second pass: build parent-child relationships
    for reply in replies:
        if reply.parent_reply_id is not None and reply.parent_reply_id in reply_dict:
            parent = reply_dict[reply.parent_reply_id]
            parent.replies.append(reply_dict[reply.id])

    return root_replies


@router.post("/", response_model=FAQReplyResponse, status_code=status.HTTP_201_CREATED)
def create_reply(
    *,
    db: Session = Depends(get_db),
    reply_in: FAQReplyCreate,
    current_user: User = Depends(get_current_user),
) -> FAQReply:
    """
    Create a new reply to an FAQ answer or another reply.
    Any authenticated user can create a reply.
    """
    # Verify FAQ exists
    faq = db.query(FAQ).filter(FAQ.id == reply_in.faq_id).first()
    if not faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"FAQ with id {reply_in.faq_id} not found"
        )

    # If parent_reply_id is provided, verify it exists
    if reply_in.parent_reply_id is not None:
        parent_reply = db.query(FAQReply).filter(FAQReply.id == reply_in.parent_reply_id).first()
        if not parent_reply:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parent reply with id {reply_in.parent_reply_id} not found"
            )
        # Ensure parent reply belongs to the same FAQ
        if parent_reply.faq_id != reply_in.faq_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent reply must belong to the same FAQ"
            )

    # Create new reply
    new_reply = FAQReply(
        faq_id=reply_in.faq_id,
        parent_reply_id=reply_in.parent_reply_id,
        user_id=current_user.id,
        username=current_user.username,
        text=reply_in.text,
        helpful_count=0,
        not_helpful_count=0,
    )

    db.add(new_reply)
    db.commit()
    db.refresh(new_reply)

    return new_reply


@router.get("/faq/{faq_id}", response_model=List[FAQReplyNested])
def get_faq_replies(
    *,
    db: Session = Depends(get_db),
    faq_id: int,
) -> List[FAQReplyNested]:
    """
    Get all replies for a specific FAQ in a nested tree structure.
    """
    # Verify FAQ exists
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"FAQ with id {faq_id} not found"
        )

    # Get all replies for this FAQ
    replies = db.query(FAQReply).filter(FAQReply.faq_id == faq_id).order_by(FAQReply.created_at.asc()).all()

    # Build nested tree structure
    return build_reply_tree(replies)


@router.get("/{reply_id}", response_model=FAQReplyResponse)
def get_reply(
    *,
    db: Session = Depends(get_db),
    reply_id: int,
) -> FAQReply:
    """Get a specific reply by ID."""
    reply = db.query(FAQReply).filter(FAQReply.id == reply_id).first()
    if not reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reply with id {reply_id} not found"
        )
    return reply


@router.patch("/{reply_id}", response_model=FAQReplyResponse)
def update_reply(
    *,
    db: Session = Depends(get_db),
    reply_id: int,
    reply_in: FAQReplyUpdate,
    current_user: User = Depends(get_current_user),
) -> FAQReply:
    """
    Update a reply (edit text or update vote counts).
    Only the reply author can edit text.
    """
    reply = db.query(FAQReply).filter(FAQReply.id == reply_id).first()
    if not reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reply with id {reply_id} not found"
        )

    # Only author can edit text
    if reply_in.text is not None and reply.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the reply author can edit the text"
        )

    # Update fields
    if reply_in.text is not None:
        reply.text = reply_in.text
    if reply_in.helpful_count is not None:
        reply.helpful_count = reply_in.helpful_count
    if reply_in.not_helpful_count is not None:
        reply.not_helpful_count = reply_in.not_helpful_count

    db.commit()
    db.refresh(reply)

    return reply


@router.delete("/{reply_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reply(
    *,
    db: Session = Depends(get_db),
    reply_id: int,
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete a reply.
    Only the reply author can delete it.
    """
    reply = db.query(FAQReply).filter(FAQReply.id == reply_id).first()
    if not reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reply with id {reply_id} not found"
        )

    # Only author can delete
    if reply.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the reply author can delete it"
        )

    db.delete(reply)
    db.commit()

    return None
