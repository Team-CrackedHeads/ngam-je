"""Recommendation API endpoints for listing matches."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Optional

from src.app.api.deps import get_current_user
from src.database import get_db
from src.models.user import User
from src.models.listing import Listing
from src.models.recommendation import Recommendation
from src.models.conversation import Conversation
from src.schemas.recommendation import (
    RecommendationCreate,
    RecommendationUpdate,
    RecommendationResponse,
    RecommendationListResponse,
)

router = APIRouter()


@router.get("/listing/{listing_id}", response_model=RecommendationListResponse)
async def get_listing_recommendations(
    listing_id: int,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Get all recommendations for a specific listing.

    This endpoint returns recommendations where the listing is either:
    - The source (listings recommended TO this listing)
    - The target (this listing is being recommended TO other listings)

    Query parameters:
    - status_filter: Filter by status (matched, pending, completed, etc.)
    """
    # Verify listing exists
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing {listing_id} not found",
        )

    # Query recommendations where listing is source OR target
    # OPTIMIZED: Use UNION instead of OR for better index usage
    source_query = db.query(Recommendation).filter(Recommendation.source_listing_id == listing_id)
    target_query = db.query(Recommendation).filter(Recommendation.target_listing_id == listing_id)

    # Filter by status if provided
    if status_filter:
        source_query = source_query.filter(Recommendation.status == status_filter)
        target_query = target_query.filter(Recommendation.status == status_filter)

    # Combine with UNION ALL (no duplicates possible since source != target)
    combined_query = source_query.union_all(target_query)

    # Get total count (optimized)
    count_source = db.query(func.count(Recommendation.id)).filter(
        Recommendation.source_listing_id == listing_id
    )
    count_target = db.query(func.count(Recommendation.id)).filter(
        Recommendation.target_listing_id == listing_id
    )
    if status_filter:
        count_source = count_source.filter(Recommendation.status == status_filter)
        count_target = count_target.filter(Recommendation.status == status_filter)
    total = (count_source.scalar() or 0) + (count_target.scalar() or 0)

    # Order by match score descending, then by created date
    recommendations = combined_query.order_by(
        Recommendation.match_score.desc(), Recommendation.created_at.desc()
    ).all()

    return RecommendationListResponse(recommendations=recommendations, total=total)


@router.get("/listing/{listing_id}/matched", response_model=RecommendationListResponse)
async def get_matched_listings(
    listing_id: int,
    db: Session = Depends(get_db),
):
    """
    Get only MATCHED recommendations for a listing.
    This is what shows in the "Matched Listings" section in the UI.

    Returns recommendations where:
    - Status is "matched" (both parties liked each other)
    - The listing is either source or target
    """
    # Verify listing exists
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing {listing_id} not found",
        )

    # Query only matched recommendations
    # OPTIMIZED: Use UNION instead of OR for better index usage
    source_query = db.query(Recommendation).filter(
        Recommendation.source_listing_id == listing_id, Recommendation.status == "matched"
    )
    target_query = db.query(Recommendation).filter(
        Recommendation.target_listing_id == listing_id, Recommendation.status == "matched"
    )

    # Combine with UNION ALL
    combined_query = source_query.union_all(target_query)

    # Get total count (optimized)
    count_source = (
        db.query(func.count(Recommendation.id))
        .filter(Recommendation.source_listing_id == listing_id, Recommendation.status == "matched")
        .scalar()
        or 0
    )
    count_target = (
        db.query(func.count(Recommendation.id))
        .filter(Recommendation.target_listing_id == listing_id, Recommendation.status == "matched")
        .scalar()
        or 0
    )
    total = count_source + count_target

    recommendations = combined_query.order_by(Recommendation.match_score.desc()).all()

    return RecommendationListResponse(recommendations=recommendations, total=total)


@router.post("/", response_model=RecommendationResponse, status_code=status.HTTP_201_CREATED)
async def create_recommendation(
    recommendation_data: RecommendationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new recommendation.

    This can be called by:
    - AI service (created_by_user_id will be NULL)
    - User clicking "Make Offer" (created_by_user_id will be current user)

    The recommendation starts with status "pending".
    """
    # Verify both listings exist
    source_listing = (
        db.query(Listing).filter(Listing.id == recommendation_data.source_listing_id).first()
    )
    if not source_listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Source listing {recommendation_data.source_listing_id} not found",
        )

    target_listing = (
        db.query(Listing).filter(Listing.id == recommendation_data.target_listing_id).first()
    )
    if not target_listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target listing {recommendation_data.target_listing_id} not found",
        )

    # Prevent duplicate recommendations
    existing = (
        db.query(Recommendation)
        .filter(
            Recommendation.source_listing_id == recommendation_data.source_listing_id,
            Recommendation.target_listing_id == recommendation_data.target_listing_id,
            Recommendation.status.in_(["pending", "liked_by_source", "liked_by_target", "matched"]),
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A recommendation between these listings already exists",
        )

    # Create new recommendation
    new_recommendation = Recommendation(
        source_listing_id=recommendation_data.source_listing_id,
        target_listing_id=recommendation_data.target_listing_id,
        created_by_user_id=current_user.id,  # Track who created it
        recommendation_type=recommendation_data.recommendation_type,
        match_score=recommendation_data.match_score,
        match_reasons=recommendation_data.match_reasons or [],
        message=recommendation_data.message,
        status="pending",
    )

    db.add(new_recommendation)
    db.commit()
    db.refresh(new_recommendation)

    return new_recommendation


@router.patch("/{recommendation_id}/like", response_model=RecommendationResponse)
async def like_recommendation(
    recommendation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Like a recommendation (user clicks heart/like on a matched listing).

    Flow:
    1. First party likes → status becomes "liked_by_source" or "liked_by_target"
    2. Second party likes → status becomes "matched" (both listings show in Matched Listings)
    """
    recommendation = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendation {recommendation_id} not found",
        )

    # Get both listings to check ownership
    source_listing = (
        db.query(Listing).filter(Listing.id == recommendation.source_listing_id).first()
    )
    target_listing = (
        db.query(Listing).filter(Listing.id == recommendation.target_listing_id).first()
    )

    # Determine which party is liking
    is_source_owner = source_listing.user_id == current_user.id
    is_target_owner = target_listing.user_id == current_user.id

    if not (is_source_owner or is_target_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only listing owners can like recommendations",
        )

    # Update status based on current state
    if recommendation.status == "pending":
        # First like
        if is_source_owner:
            recommendation.status = "liked_by_source"
        else:
            recommendation.status = "liked_by_target"
    elif recommendation.status == "liked_by_source" and is_target_owner:
        # Second like - both parties liked
        recommendation.status = "matched"
    elif recommendation.status == "liked_by_target" and is_source_owner:
        # Second like - both parties liked
        recommendation.status = "matched"

    db.commit()
    db.refresh(recommendation)

    # Auto-create conversation if status became "matched"
    if recommendation.status == "matched":
        # Check if conversation already exists
        existing_conversation = (
            db.query(Conversation)
            .filter(Conversation.recommendation_id == recommendation.id)
            .first()
        )

        if not existing_conversation:
            # Create new conversation
            new_conversation = Conversation(recommendation_id=recommendation.id, is_active=True)
            db.add(new_conversation)
            db.commit()

    return recommendation


@router.patch("/{recommendation_id}/checkout", response_model=RecommendationResponse)
async def checkout_recommendation(
    recommendation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Checkout a matched recommendation (user clicks "Checkout" button).

    Flow:
    1. First party checkouts → status becomes "checkout_by_source" or "checkout_by_target"
    2. Second party checkouts → status becomes "completed"
    3. When completed, both listings are hidden (is_matched=True, is_active=False)
    """
    recommendation = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendation {recommendation_id} not found",
        )

    # Only matched recommendations can be checked out
    if recommendation.status not in ["matched", "checkout_by_source", "checkout_by_target"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only matched recommendations can be checked out",
        )

    # Get both listings
    source_listing = (
        db.query(Listing).filter(Listing.id == recommendation.source_listing_id).first()
    )
    target_listing = (
        db.query(Listing).filter(Listing.id == recommendation.target_listing_id).first()
    )

    # Check ownership
    is_source_owner = source_listing.user_id == current_user.id
    is_target_owner = target_listing.user_id == current_user.id

    if not (is_source_owner or is_target_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only listing owners can checkout recommendations",
        )

    # Update status based on current state
    if recommendation.status == "matched":
        # First checkout
        if is_source_owner:
            recommendation.status = "checkout_by_source"
        else:
            recommendation.status = "checkout_by_target"
    elif recommendation.status == "checkout_by_source" and is_target_owner:
        # Second checkout - both parties checked out
        recommendation.status = "completed"
        # Hide both listings from public
        source_listing.is_matched = True
        source_listing.is_active = False
        target_listing.is_matched = True
        target_listing.is_active = False
    elif recommendation.status == "checkout_by_target" and is_source_owner:
        # Second checkout - both parties checked out
        recommendation.status = "completed"
        # Hide both listings from public
        source_listing.is_matched = True
        source_listing.is_active = False
        target_listing.is_matched = True
        target_listing.is_active = False

    db.commit()
    db.refresh(recommendation)

    return recommendation


@router.patch("/{recommendation_id}/reject", response_model=RecommendationResponse)
async def reject_recommendation(
    recommendation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Reject a recommendation (user clicks "Pass" or "X" button).
    """
    recommendation = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendation {recommendation_id} not found",
        )

    # Get both listings to check ownership
    source_listing = (
        db.query(Listing).filter(Listing.id == recommendation.source_listing_id).first()
    )
    target_listing = (
        db.query(Listing).filter(Listing.id == recommendation.target_listing_id).first()
    )

    # Check ownership
    is_source_owner = source_listing.user_id == current_user.id
    is_target_owner = target_listing.user_id == current_user.id

    if not (is_source_owner or is_target_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only listing owners can reject recommendations",
        )

    recommendation.status = "rejected"

    db.commit()
    db.refresh(recommendation)

    return recommendation


@router.patch("/{recommendation_id}", response_model=RecommendationResponse)
async def update_recommendation(
    recommendation_id: int,
    recommendation_data: RecommendationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update recommendation (for AI service to update match scores/reasons).
    """
    recommendation = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendation {recommendation_id} not found",
        )

    # Update fields that were provided
    update_data = recommendation_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(recommendation, field, value)

    db.commit()
    db.refresh(recommendation)

    return recommendation


@router.delete("/{recommendation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recommendation(
    recommendation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete a recommendation (for cleanup/admin purposes).
    """
    recommendation = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendation {recommendation_id} not found",
        )

    db.delete(recommendation)
    db.commit()

    return None
