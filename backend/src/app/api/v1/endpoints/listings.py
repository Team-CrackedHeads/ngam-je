"""Listing API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Optional
import re

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
    CheckoutConfirm,
)
from src.models.recommendation import Recommendation

router = APIRouter()


def extract_city_from_address(address: str) -> str:
    """
    Extract city name from a full address string.
    Handles Malaysian addresses like "KL Bird Park, 920, Jalan..., 50480 Kuala Lumpur, ..."
    Returns just the city name, max 100 characters.
    Priority: Cities over states, specific locations over general areas.
    """
    if not address:
        return ""

    # Common Malaysian cities (ordered by priority - cities first, states excluded)
    # Cities in Selangor
    cities = [
        "Petaling Jaya", "Shah Alam", "Subang Jaya", "Klang", "Puchong",
        "Cyberjaya", "Kajang", "Bangi", "Ampang", "Cheras", "Setia Alam",
        "Seri Kembangan", "Rawang", "Banting", "Sepang",
        # Federal Territories
        "Kuala Lumpur", "Putrajaya",
        # Penang
        "Georgetown", "George Town", "Butterworth", "Bayan Lepas",
        # Johor
        "Johor Bahru", "Skudai", "Iskandar Puteri", "Nusajaya",
        # Other major cities
        "Malacca", "Melaka", "Ipoh", "Kota Kinabalu", "Kuching",
        "Seremban", "Nilai", "Port Dickson",
    ]

    # Try to find a known city in the address (prioritize longer/more specific names)
    # Sort by length descending to match "Petaling Jaya" before "Jaya"
    for city in sorted(cities, key=len, reverse=True):
        if city.lower() in address.lower():
            return city

    # Fallback: Try to extract part after postal code (Malaysian format: 5 digits)
    # Example: "50480 Kuala Lumpur, Wilayah Persekutuan" -> extract "Kuala Lumpur"
    postal_match = re.search(r'\d{5}\s+([^,]+)', address)
    if postal_match:
        extracted = postal_match.group(1).strip()
        # Remove state names and extra info
        extracted = re.sub(r',?\s*(Wilayah Persekutuan|Selangor|Penang|Johor|Negeri Sembilan|Melaka|Perak|Sabah|Sarawak).*$', '', extracted, flags=re.IGNORECASE)
        extracted = extracted.strip()
        if extracted and len(extracted) <= 100:
            return extracted

    # Last resort: Take first part before first comma, limited to 100 chars
    first_part = address.split(',')[0].strip()
    return first_part[:100]


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

    # Get total count before pagination (optimized - counts IDs only, not all columns)
    count_query = db.query(func.count(Listing.id))
    if listing_type:
        count_query = count_query.filter(Listing.listing_type == listing_type)
    if thread_id:
        count_query = count_query.filter(Listing.thread_id == thread_id)
    if is_active is not None:
        count_query = count_query.filter(Listing.is_active == is_active)
    total = count_query.scalar()

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

    # Extract city from full address to fit in 100 char limit
    city_location = extract_city_from_address(listing_data.creator_location or "")

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
        creator_location=city_location,  # Extract just the city
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
                question_user_id=current_user.id,  # Set question user to listing creator
                answer_user_id=current_user.id if faq_item.answer else None,
                question_username=current_user.username,  # Show listing creator's username
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

    # Get total count before pagination (optimized - counts IDs only, not all columns)
    count_query = db.query(func.count(Listing.id)).filter(Listing.user_id == user_id)
    if listing_type:
        count_query = count_query.filter(Listing.listing_type == listing_type)
    if is_active is not None:
        count_query = count_query.filter(Listing.is_active == is_active)
    total = count_query.scalar()

    # Apply pagination and ordering (newest first)
    listings = query.order_by(Listing.created_at.desc()).offset(skip).limit(limit).all()

    return ListingListResponse(listings=listings, total=total)


@router.post("/{listing_id}/checkout", response_model=ListingResponse)
async def confirm_checkout(
    listing_id: int,
    checkout_data: CheckoutConfirm,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Confirm checkout for a matched listing.

    When a user confirms checkout, this marks the listing as checked out.
    Both users in a match need to confirm for the deal to be finalized.
    """
    # Get the listing
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )

    # Get the recommendation to find the matched listing
    recommendation = db.query(Recommendation).filter(
        Recommendation.id == checkout_data.recommendation_id
    ).first()

    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found",
        )

    # Verify this recommendation is for this listing
    if recommendation.source_listing_id != listing_id and recommendation.target_listing_id != listing_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recommendation does not match this listing",
        )

    # Verify the recommendation is in matched status
    if recommendation.status != "matched":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only checkout matched listings",
        )

    # Get the other listing in the match
    other_listing_id = (
        recommendation.target_listing_id
        if recommendation.source_listing_id == listing_id
        else recommendation.source_listing_id
    )
    other_listing = db.query(Listing).filter(Listing.id == other_listing_id).first()

    # Mark both listings as checked out
    listing.is_checked_out = True
    if other_listing:
        other_listing.is_checked_out = True

    # TODO: Create a Deal/Transaction record to store checkout details
    # For now, we're just marking the listings as checked out

    db.commit()
    db.refresh(listing)

    return listing
