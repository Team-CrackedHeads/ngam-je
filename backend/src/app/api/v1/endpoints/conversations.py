"""Conversation API endpoints for user messaging."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from src.app.api.deps import get_current_user
from src.database import get_db
from src.models.user import User
from src.models.conversation import Conversation
from src.models.recommendation import Recommendation
from src.schemas.conversation import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
)

router = APIRouter()


@router.get("/user")
async def get_user_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all conversations for the current user with enriched data.

    Returns conversations where the user is part of a matched recommendation,
    including other user's name and listing details.
    Ordered by last_message_at (most recent first).

    OPTIMIZED: Uses eager loading to prevent N+1 query problem.
    """
    # Get all conversations with eager loading of related data
    # This loads everything in 1-2 queries instead of 60+
    conversations = (
        db.query(Conversation)
        .join(Recommendation, Conversation.recommendation_id == Recommendation.id)
        .options(
            joinedload(Conversation.recommendation).joinedload(Recommendation.source_listing),
            joinedload(Conversation.recommendation).joinedload(Recommendation.target_listing),
        )
        .filter(
            (Recommendation.source_listing.has(user_id=current_user.id))
            | (Recommendation.target_listing.has(user_id=current_user.id))
        )
        .order_by(Conversation.last_message_at.desc().nullslast(), Conversation.created_at.desc())
        .all()
    )

    # Enrich with user and listing data (no additional queries needed!)
    enriched_conversations = []
    for conv in conversations:
        rec = conv.recommendation
        # Listings are already loaded via eager loading
        source_listing = rec.source_listing
        target_listing = rec.target_listing

        # Determine which user is the "other" user
        if source_listing.user_id == current_user.id:
            # Current user owns source listing, so other user owns target
            other_listing = target_listing
            my_listing = source_listing
        else:
            # Current user owns target listing, so other user owns source
            other_listing = source_listing
            my_listing = target_listing

        # User data is stored denormalized in listings - no extra query needed!
        # The listing model stores creator_name, so we can use that
        # If not available, we need to query the user
        other_user_name = (
            other_listing.creator_name if hasattr(other_listing, "creator_name") else None
        )
        if not other_user_name:
            # Fallback: query user (should be rare if creator_name is properly set)
            other_user = db.query(User).filter(User.id == other_listing.user_id).first()
            other_user_name = other_user.username if other_user else "Unknown User"
            other_user_id = other_user.id if other_user else None
        else:
            other_user_id = other_listing.user_id

        # Get listing image (use image_url or first gallery image)
        listing_image = other_listing.image_url
        if not listing_image and other_listing.gallery:
            listing_image = other_listing.gallery[0] if len(other_listing.gallery) > 0 else None

        enriched_conversations.append(
            {
                "id": conv.id,
                "recommendation_id": conv.recommendation_id,
                "is_active": conv.is_active,
                "created_at": conv.created_at.isoformat(),
                "updated_at": conv.updated_at.isoformat(),
                "last_message_at": (
                    conv.last_message_at.isoformat() if conv.last_message_at else None
                ),
                # Enriched data
                "other_user_name": other_user_name,
                "other_user_id": other_user_id,
                "listing_title": other_listing.title,
                "listing_image": listing_image,
                "my_listing_title": my_listing.title,
            }
        )

    return {"conversations": enriched_conversations, "total": len(enriched_conversations)}


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get a specific conversation by ID.

    Only returns if the current user is part of the conversation.
    """
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation {conversation_id} not found",
        )

    # Verify user is part of this conversation via recommendation
    recommendation = conversation.recommendation

    # Check if user owns either the source or target listing
    # (You may need to adjust this based on your Listing model structure)
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

    return conversation


@router.post("/", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conversation_in: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new conversation for a matched recommendation.

    This is typically auto-created when a recommendation status becomes "matched",
    but can also be manually triggered.
    """
    # Check if recommendation exists and is matched
    recommendation = (
        db.query(Recommendation)
        .filter(Recommendation.id == conversation_in.recommendation_id)
        .first()
    )

    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendation {conversation_in.recommendation_id} not found",
        )

    if recommendation.status != "matched":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only create conversations for matched recommendations",
        )

    # Check if conversation already exists for this recommendation
    existing = (
        db.query(Conversation)
        .filter(Conversation.recommendation_id == conversation_in.recommendation_id)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Conversation already exists for this recommendation (ID: {existing.id})",
        )

    # Verify user is part of this recommendation
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
            detail="You don't have access to create this conversation",
        )

    # Create conversation
    conversation = Conversation(recommendation_id=conversation_in.recommendation_id, is_active=True)

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


@router.patch("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: int,
    conversation_in: ConversationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update a conversation (e.g., archive it).
    """
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
            detail="You don't have access to update this conversation",
        )

    # Update fields
    if conversation_in.is_active is not None:
        conversation.is_active = conversation_in.is_active

    db.commit()
    db.refresh(conversation)

    return conversation
