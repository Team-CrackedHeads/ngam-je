"""
Main Matching Service - Orchestrates the entire matching and negotiation flow
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from src.app.core.logging_config import get_logger
from src.models.listing import Listing
from src.models.recommendation import Recommendation
from src.models.conversation import Conversation
from src.models.message import Message
from .config import DEFAULT_CONFIG
from .models import MatchCandidate
from .rag_service import create_match_store, cleanup_match_store
from .negotiation_agents import run_ai_negotiation

logger = get_logger("app.services.matching.matching_service")


def find_potential_matches(listing: Listing, db: Session) -> list[MatchCandidate]:
    """
    Find potential matches for a listing using SQL query

    For WTB listings: Find WTS listings
    For WTS listings: Find WTB listings

    IMPORTANT: Only matches within the SAME THREAD
    """
    logger.info(f"Finding matches for {listing.listing_type} listing {listing.id} in thread {listing.thread_id}")

    # Determine opposite type
    target_type = "sale" if listing.listing_type == "wanted" else "wanted"

    # Base query: Find opposite type listings that are active IN THE SAME THREAD
    query = db.query(Listing).filter(
        Listing.thread_id == listing.thread_id,  # ← SAME THREAD ONLY!
        Listing.listing_type == target_type,
        Listing.user_id != listing.user_id,  # ← DIFFERENT USER ONLY!
        Listing.is_active == True,
        Listing.is_matched == False,
        Listing.id != listing.id,  # Don't match with self
    )

    # Price range overlap filter
    if listing.listing_type == "wanted":
        # WTB: buyer's max >= seller's min
        query = query.filter(Listing.min_price <= listing.max_price)
    else:
        # WTS: seller's min <= buyer's max
        query = query.filter(Listing.max_price >= listing.min_price)

    potential_matches = query.all()

    logger.info(f"Found {len(potential_matches)} potential matches")

    # Score and rank matches
    candidates = []
    for match in potential_matches:
        score, reasons = calculate_match_score(listing, match)
        candidates.append(
            MatchCandidate(listing_id=match.id, score=score, reasons=reasons)
        )

    # Sort by score descending
    candidates.sort(key=lambda x: x.score, reverse=True)

    # Return top N
    top_candidates = candidates[: DEFAULT_CONFIG.TOP_N_MATCHES]
    logger.info(
        f"Top {len(top_candidates)} candidates: {[c.listing_id for c in top_candidates]}"
    )

    return top_candidates


def calculate_match_score(listing_a: Listing, listing_b: Listing) -> tuple[float, list[str]]:
    """
    Calculate match score between two listings

    Returns: (score, reasons)
    """
    score = 0.0
    reasons = []

    # 1. Price compatibility (40 points)
    if listing_a.listing_type == "wanted":
        wtb, wts = listing_a, listing_b
    else:
        wtb, wts = listing_b, listing_a

    # Calculate price overlap
    overlap_min = max(wtb.min_price, wts.min_price)
    overlap_max = min(wtb.max_price, wts.max_price)

    if overlap_max >= overlap_min:
        # Price ranges overlap
        overlap_size = overlap_max - overlap_min
        total_range = max(wtb.max_price - wtb.min_price, wts.max_price - wts.min_price)
        price_score = 40 * (overlap_size / total_range) if total_range > 0 else 40
        score += price_score
        reasons.append(f"Price range overlap: ${overlap_min:.2f}-${overlap_max:.2f}")

    # 2. Tag similarity (30 points)
    tags_a = set(listing_a.tags or [])
    tags_b = set(listing_b.tags or [])

    if tags_a and tags_b:
        common_tags = tags_a & tags_b
        if common_tags:
            tag_score = 30 * (len(common_tags) / max(len(tags_a), len(tags_b)))
            score += tag_score
            reasons.append(f"Shared tags: {', '.join(list(common_tags)[:3])}")

    # 3. Location match (15 points)
    if listing_a.creator_location and listing_b.creator_location:
        if listing_a.creator_location.lower() == listing_b.creator_location.lower():
            score += 15
            reasons.append(f"Same location: {listing_a.creator_location}")

    # 4. Freshness (15 points) - both listings are recent
    import datetime
    now = datetime.datetime.now(datetime.timezone.utc)

    if listing_a.created_at and listing_b.created_at:
        days_old_a = (now - listing_a.created_at).days
        days_old_b = (now - listing_b.created_at).days

        if days_old_a < 7 and days_old_b < 7:  # Both less than a week old
            score += 15
            reasons.append("Both listings are recent")

    return score, reasons


async def run_matching_for_listing(listing_id: int, db: Session):
    """
    Main entry point: Run matching for a newly created listing

    This is called as a background task when a listing is created
    """
    logger.info(f"=== Starting matching for listing {listing_id} ===")

    try:
        # 1. Get the listing (eager load FAQs for RAG context)
        from sqlalchemy.orm import selectinload
        listing = (
            db.query(Listing)
            .options(selectinload(Listing.faq_questions))
            .filter(Listing.id == listing_id)
            .first()
        )
        if not listing:
            logger.error(f"Listing {listing_id} not found")
            return

        # 2. Find potential matches
        candidates = find_potential_matches(listing, db)

        if not candidates:
            logger.info(f"No matches found for listing {listing_id}")
            return

        # 3. For each candidate, run AI negotiation
        for candidate in candidates:
            try:
                await run_matching_and_negotiation(listing, candidate.listing_id, db)
            except Exception as e:
                logger.error(
                    f"Error matching listing {listing_id} with {candidate.listing_id}: {e}"
                )
                continue

        logger.info(f"=== Matching complete for listing {listing_id} ===")

    except Exception as e:
        logger.error(f"Fatal error in run_matching_for_listing: {e}")


async def run_matching_and_negotiation(
    source_listing: Listing, target_listing_id: int, db: Session
):
    """
    Run AI negotiation between two listings and save results
    """
    logger.info(f"Negotiating: {source_listing.id} <-> {target_listing_id}")

    # Get target listing (eager load FAQs for RAG context)
    from sqlalchemy.orm import selectinload
    target_listing = (
        db.query(Listing)
        .options(selectinload(Listing.faq_questions))
        .filter(Listing.id == target_listing_id)
        .first()
    )
    if not target_listing:
        logger.error(f"Target listing {target_listing_id} not found")
        return

    # Determine buyer and seller
    if source_listing.listing_type == "wanted":
        wtb_listing = source_listing
        wts_listing = target_listing
    else:
        wtb_listing = target_listing
        wts_listing = source_listing

    # Check if recommendation already exists
    existing = (
        db.query(Recommendation)
        .filter(
            or_(
                and_(
                    Recommendation.source_listing_id == source_listing.id,
                    Recommendation.target_listing_id == target_listing_id,
                ),
                and_(
                    Recommendation.source_listing_id == target_listing_id,
                    Recommendation.target_listing_id == source_listing.id,
                ),
            )
        )
        .first()
    )

    if existing:
        logger.info(f"Recommendation already exists: {existing.id}")
        return

    try:
        # 1. Create File Search store
        store_name = await create_match_store(wtb_listing, wts_listing)

        # 2. Run AI negotiation
        negotiation_result = await run_ai_negotiation(store_name, wtb_listing, wts_listing)

        # 3. Create recommendation
        recommendation = Recommendation(
            source_listing_id=source_listing.id,
            target_listing_id=target_listing.id,
            created_by_user_id=None,  # AI-generated
            recommendation_type="ai_match",
            match_score=negotiation_result.match_score,
            match_reasons=[negotiation_result.conversation_summary],
            status="pending",  # Always start as pending - users must like to match
            message=negotiation_result.conversation_summary,
        )
        db.add(recommendation)
        db.commit()
        db.refresh(recommendation)

        logger.info(f"Created recommendation {recommendation.id} with score {negotiation_result.match_score}")

        # 4. Create conversation with AI negotiation messages
        # This allows users to PREVIEW the AI negotiation before deciding to like/pass
        conversation = Conversation(
            recommendation_id=recommendation.id, is_active=True
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        logger.info(f"Created conversation {conversation.id}")

        # 5. Add AI negotiation messages
        for msg in negotiation_result.conversation:
            ai_message = Message(
                conversation_id=conversation.id,
                sender_id=None,
                content=msg.message,
                message_type="ai_buyer" if msg.role == "buyer" else "ai_seller",
                is_read=False,
                created_at=msg.timestamp,
            )
            db.add(ai_message)

        db.commit()

        logger.info(f"Added {len(negotiation_result.conversation)} AI messages")

        # 6. Cleanup store (optional - comment out to keep for debugging)
        # await cleanup_match_store(store_name)

        logger.info(f"Successfully completed matching for {source_listing.id} <-> {target_listing_id}")

    except Exception as e:
        logger.error(f"Error in negotiation: {e}")
        db.rollback()
        raise
