"""Listing API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from src.app.api.deps import get_current_user
from src.database import get_db
from src.models.user import User
from src.models.listing import Listing
from src.models.thread import Thread
from src.schemas.listing import (
    ListingCreate,
    ListingUpdate,
    ListingResponse,
    ListingListResponse,
)

router = APIRouter()


@router.get("/", response_model=ListingListResponse)
async def list_listings(
    skip: int = 0,
    limit: int = 100,
    listing_type: Optional[str] = None,
    thread_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    """
    List all listings with optional filtering.

    Query parameters:
    - skip: Number of records to skip (pagination)
    - limit: Maximum number of records to return
    - listing_type: Filter by listing type ("sale" or "wanted")
    - thread_id: Filter by thread ID (**IMPORTANT** for showing listings in a thread)
    - is_active: Filter by active status
    """
    query = db.query(Listing)

    # Filter by listing type
    if listing_type:
        query = query.filter(Listing.listing_type == listing_type)

    # Filter by thread ID (critical for thread-scoped listings)
    if thread_id:
        query = query.filter(Listing.thread_id == thread_id)

    # Filter by active status
    if is_active is not None:
        query = query.filter(Listing.is_active == is_active)

    # Get total count before pagination
    total = query.count()

    # Apply pagination and ordering (newest first)
    listings = query.order_by(Listing.created_at.desc()).offset(skip).limit(limit).all()

    return ListingListResponse(listings=listings, total=total)


@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(listing_id: int, db: Session = Depends(get_db)):
    """
    Get a specific listing by ID.
    Automatically increments view count.
    """
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing {listing_id} not found",
        )

    # Increment view count
    listing.views += 1
    db.commit()
    db.refresh(listing)

    return listing


@router.post("/", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
async def create_listing(
    listing_data: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new listing.

    Requires authentication. Listing will be associated with the current user
    and the specified thread.
    """
    # Verify thread exists
    thread = db.query(Thread).filter(Thread.id == listing_data.thread_id).first()
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Thread {listing_data.thread_id} not found",
        )

    # Determine creator_verified: true if KYC verified OR if ownership proof provided (for sell listings)
    creator_verified = current_user.kyc_verified_at is not None
    if listing_data.listing_type == "sale" and listing_data.ownership_proof_url:
        creator_verified = True

    # Create new listing (without FAQs)
    new_listing = Listing(
        user_id=current_user.id,
        thread_id=listing_data.thread_id,
        title=listing_data.title,
        description=listing_data.description,
        price=listing_data.price,
        min_price=listing_data.min_price,
        max_price=listing_data.max_price,
        currency=listing_data.currency,
        listing_type=listing_data.listing_type,
        image_url=listing_data.image_url,
        gallery=listing_data.gallery or [],
        tags=listing_data.tags or [],
        protected=listing_data.protected,
        creator_name=current_user.username,  # From user profile
        creator_location=listing_data.creator_location,
        creator_verified=creator_verified,
        shipping_options=listing_data.shipping_options or [],
        inventory_quantity=listing_data.inventory_quantity,
        ownership_proof_url=listing_data.ownership_proof_url,
    )

    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)

    # Create FAQs in the separate faqs table
    if listing_data.faqs:
        from src.models.faq import FAQ

        for faq_item in listing_data.faqs:
            new_faq = FAQ(
                listing_id=new_listing.id,
                question=faq_item.question,
                answer=faq_item.answer if faq_item.answer else None,
                question_user_id=None,  # No specific user for pre-populated FAQs
                answer_user_id=current_user.id if faq_item.answer else None,
                question_username=None,
                answer_username=current_user.username if faq_item.answer else None,
                is_answered=bool(faq_item.answer),
                is_accepted=False,
                helpful_count=0,
                not_helpful_count=0,
            )
            db.add(new_faq)

        db.commit()

    return new_listing


@router.put("/{listing_id}", response_model=ListingResponse)
async def update_listing(
    listing_id: int,
    listing_data: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update an existing listing.

    Only the listing creator can update it.
    """
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing {listing_id} not found",
        )

    # Check if current user is the creator
    if listing.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the listing creator can update it",
        )

    # Update fields that were provided
    update_data = listing_data.model_dump(exclude_unset=True)

    # Convert FAQ objects to dicts if present
    if "faqs" in update_data and update_data["faqs"]:
        update_data["faqs"] = [
            faq.model_dump() if hasattr(faq, "model_dump") else faq
            for faq in update_data["faqs"]
        ]

    for field, value in update_data.items():
        setattr(listing, field, value)

    db.commit()
    db.refresh(listing)

    return listing


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete a listing (soft delete - sets is_active=False).

    Only the listing creator can delete it.
    """
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing {listing_id} not found",
        )

    # Check if current user is the creator
    if listing.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the listing creator can delete it",
        )

    # Soft delete
    listing.is_active = False
    db.commit()

    return None


@router.get("/user/{user_id}", response_model=ListingListResponse)
async def get_user_listings(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    listing_type: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    """
    Get all listings for a specific user.

    Query parameters:
    - skip: Number of records to skip (pagination)
    - limit: Maximum number of records to return
    - listing_type: Filter by listing type ("sale" or "wanted")
    - is_active: Filter by active status
    """
    query = db.query(Listing).filter(Listing.user_id == user_id)

    # Filter by listing type
    if listing_type:
        query = query.filter(Listing.listing_type == listing_type)

    # Filter by active status
    if is_active is not None:
        query = query.filter(Listing.is_active == is_active)

    # Get total count before pagination
    total = query.count()

    # Apply pagination and ordering (newest first)
    listings = query.order_by(Listing.created_at.desc()).offset(skip).limit(limit).all()

    return ListingListResponse(listings=listings, total=total)
