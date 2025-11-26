"""FAQ endpoints for listing questions and answers."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from src.database import get_db
from src.models.user import User
from src.models.faq import FAQ
from src.models.listing import Listing
from src.schemas.faq import (
    FAQQuestionCreate,
    FAQAnswerCreate,
    FAQUpdate,
    FAQResponse,
    FAQListResponse,
)
from src.app.api.deps import get_current_user
from datetime import datetime, timezone

router = APIRouter()


@router.post("/questions", response_model=FAQResponse, status_code=status.HTTP_201_CREATED)
def create_question(
    *,
    db: Session = Depends(get_db),
    faq_in: FAQQuestionCreate,
    current_user: User = Depends(get_current_user),
) -> FAQ:
    """
    Create a new question for a listing.
    Any authenticated user can ask a question.
    """
    # Verify listing exists
    listing = db.query(Listing).filter(Listing.id == faq_in.listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {faq_in.listing_id} not found",
        )

    # Create new FAQ question
    faq = FAQ(
        listing_id=faq_in.listing_id,
        question_user_id=current_user.id,
        question_username=current_user.username,
        question=faq_in.question,
        is_answered=False,
        is_accepted=False,
        helpful_count=0,
        not_helpful_count=0,
    )

    db.add(faq)
    db.commit()
    db.refresh(faq)

    return faq


@router.post("/{faq_id}/answer", response_model=FAQResponse)
def answer_question(
    *,
    db: Session = Depends(get_db),
    faq_id: int,
    answer_in: FAQAnswerCreate,
    current_user: User = Depends(get_current_user),
) -> FAQ:
    """
    Answer a question on a listing.
    Only the listing owner can answer questions.
    """
    # Get the FAQ
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"FAQ with id {faq_id} not found"
        )

    # Get the listing to check ownership
    listing = db.query(Listing).filter(Listing.id == faq.listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")

    # Only listing owner can answer
    if listing.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the listing owner can answer questions",
        )

    # Update FAQ with answer (allow multiple answers/updates)
    faq.answer = answer_in.answer
    faq.answer_user_id = current_user.id
    faq.answer_username = current_user.username
    faq.is_answered = True
    faq.answered_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(faq)

    return faq


@router.get("/listing/{listing_id}", response_model=FAQListResponse)
def get_listing_faqs(
    *,
    db: Session = Depends(get_db),
    listing_id: int,
    is_answered: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
) -> dict:
    """
    Get all FAQs for a specific listing.
    Filter by answered/unanswered status if specified.
    """
    # Verify listing exists
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Listing with id {listing_id} not found"
        )

    # Build query
    query = db.query(FAQ).filter(FAQ.listing_id == listing_id)

    # Filter by answered status if specified
    if is_answered is not None:
        query = query.filter(FAQ.is_answered == is_answered)

    # Order by: accepted first, then by helpful count, then by creation date
    query = query.order_by(FAQ.is_accepted.desc(), FAQ.helpful_count.desc(), FAQ.created_at.desc())

    # Get total count
    total = query.count()

    # Apply pagination
    faqs = query.offset(skip).limit(limit).all()

    return {"faqs": faqs, "total": total}


@router.get("/{faq_id}", response_model=FAQResponse)
def get_faq(
    *,
    db: Session = Depends(get_db),
    faq_id: int,
) -> FAQ:
    """Get a specific FAQ by ID."""
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"FAQ with id {faq_id} not found"
        )
    return faq


@router.patch("/{faq_id}", response_model=FAQResponse)
def update_faq(
    *,
    db: Session = Depends(get_db),
    faq_id: int,
    faq_in: FAQUpdate,
    current_user: User = Depends(get_current_user),
) -> FAQ:
    """
    Update FAQ (mark as accepted, update vote counts).
    Only listing owner can mark as accepted.
    """
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"FAQ with id {faq_id} not found"
        )

    # Get listing to check ownership
    listing = db.query(Listing).filter(Listing.id == faq.listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")

    # Only listing owner can mark as accepted
    if faq_in.is_accepted is not None and listing.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the listing owner can mark answers as accepted",
        )

    # Update fields
    if faq_in.is_accepted is not None:
        faq.is_accepted = faq_in.is_accepted
    if faq_in.helpful_count is not None:
        faq.helpful_count = faq_in.helpful_count
    if faq_in.not_helpful_count is not None:
        faq.not_helpful_count = faq_in.not_helpful_count

    db.commit()
    db.refresh(faq)

    return faq


@router.delete("/{faq_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_faq(
    *,
    db: Session = Depends(get_db),
    faq_id: int,
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete a FAQ.
    Only the user who asked the question can delete it.
    """
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"FAQ with id {faq_id} not found"
        )

    # Only question author can delete
    if faq.question_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Only the question author can delete it"
        )

    db.delete(faq)
    db.commit()

    return None
