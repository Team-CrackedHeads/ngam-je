"""
Main Matching Service - Orchestrates the entire matching and negotiation flow
"""

import asyncio
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from src.app.core.logging_config import get_logger
from src.models.listing import Listing
from src.models.recommendation import Recommendation
from src.models.conversation import Conversation
from src.models.message import Message
from src.database import SessionLocal
from .config import DEFAULT_CONFIG
from .models import MatchCandidate
from .rag_service import create_match_store, cleanup_match_store
from .negotiation_agents import run_ai_negotiation, run_ai_negotiation_with_live_messages

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


async def run_matching_for_listing(listing_id: int):
    """
    Main entry point: Run matching for a newly created listing

    This is called as a background task when a listing is created.
    Creates its own database session to avoid using closed sessions from the request.
    """
    logger.info(f"=== Starting matching for listing {listing_id} ===")

    # Create a new database session for this background task
    db = SessionLocal()
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

        # 3. Run AI negotiations in parallel using asyncio.gather
        logger.info(f"Processing {len(candidates)} candidates in parallel")

        # Create tasks for all candidates
        tasks = [
            run_matching_and_negotiation_with_session(listing, candidate.listing_id)
            for candidate in candidates
        ]

        # Execute all tasks concurrently and collect results
        # return_exceptions=True ensures one failure doesn't stop others
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Log results
        success_count = sum(1 for r in results if not isinstance(r, Exception))
        error_count = sum(1 for r in results if isinstance(r, Exception))

        logger.info(
            f"=== Matching complete for listing {listing_id}: "
            f"{success_count} successful, {error_count} failed ==="
        )

        # Log any errors that occurred
        for idx, result in enumerate(results):
            if isinstance(result, Exception):
                candidate_id = candidates[idx].listing_id
                logger.error(
                    f"Error matching listing {listing_id} with {candidate_id}: {result}"
                )

    except Exception as e:
        logger.error(f"Fatal error in run_matching_for_listing: {e}")
    finally:
        # Always close the database session
        db.close()
        logger.info(f"Closed database session for listing {listing_id}")


async def run_matching_and_negotiation_with_session(
    source_listing: Listing, target_listing_id: int
):
    """
    Wrapper function that creates its own database session for concurrent execution

    This is needed because asyncio.gather runs tasks concurrently, and each task
    needs its own database session to avoid conflicts.
    """
    # Create a new database session for this task
    db = SessionLocal()
    try:
        # Re-query the source listing in this session to avoid detached instance issues
        from sqlalchemy.orm import selectinload
        source_listing_fresh = (
            db.query(Listing)
            .options(selectinload(Listing.faq_questions))
            .filter(Listing.id == source_listing.id)
            .first()
        )

        if not source_listing_fresh:
            logger.error(f"Source listing {source_listing.id} not found in new session")
            return

        # Run the negotiation with the fresh listing and this session
        await run_matching_and_negotiation(source_listing_fresh, target_listing_id, db)
    finally:
        # Always close the session
        db.close()


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
        # 1. Create recommendation FIRST (with placeholder score)
        recommendation = Recommendation(
            source_listing_id=source_listing.id,
            target_listing_id=target_listing.id,
            created_by_user_id=None,  # AI-generated
            recommendation_type="ai_match",
            match_score=0.0,  # Will be updated after negotiation
            match_reasons=[],  # Will be updated after negotiation
            status="pending",
            message="AI negotiation in progress...",
        )
        db.add(recommendation)
        db.commit()
        db.refresh(recommendation)

        logger.info(f"Created recommendation {recommendation.id} (negotiation pending)")

        # 2. Create conversation IMMEDIATELY (before negotiation)
        # This allows users to see the conversation appear and watch messages in real-time
        conversation = Conversation(
            recommendation_id=recommendation.id, is_active=True
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        logger.info(f"Created conversation {conversation.id} - ready for live messages")

        # IMPORTANT: Commit and close the session NOW before expensive operations
        # This releases all database locks and allows other queries to proceed
        db.commit()
        logger.info(f"✅ Committed recommendation {recommendation.id} and conversation {conversation.id}")

        # Store IDs before closing session
        recommendation_id = recommendation.id
        conversation_id = conversation.id
        wtb_listing_id = wtb_listing.id
        wts_listing_id = wts_listing.id

        # Close the session to release all locks
        db.close()
        logger.info(f"✅ Released database session - users can now query while we work")

        # 4. Query the listings we need, then close session before expensive operations
        db = SessionLocal()
        try:
            # Re-query the listings with eager loading of FAQs
            from sqlalchemy.orm import selectinload
            wtb_listing = (
                db.query(Listing)
                .options(selectinload(Listing.faq_questions))
                .filter(Listing.id == wtb_listing_id)
                .first()
            )
            wts_listing = (
                db.query(Listing)
                .options(selectinload(Listing.faq_questions))
                .filter(Listing.id == wts_listing_id)
                .first()
            )

            if not wtb_listing or not wts_listing:
                logger.error("Failed to re-query listings in new session")
                return

            # Expunge from session so we can use them after closing
            db.expunge(wtb_listing)
            db.expunge(wts_listing)

            # Close session BEFORE the expensive File Search operation
            db.close()
            logger.info(f"✅ Closed DB session before File Search - store creation won't block queries")

        finally:
            # Make sure we don't try to close again in the outer finally block
            pass

        # 3. Create File Search store (this takes ~15 seconds) - NO DB SESSION HELD
        store_name = await create_match_store(wtb_listing, wts_listing)

        # 5. Open a NEW session for the negotiation
        db = SessionLocal()
        try:

            # Run AI negotiation with live message saving
            negotiation_result = await run_ai_negotiation_with_live_messages(
                store_name, wtb_listing, wts_listing, conversation_id, db
            )

            # 5. Update recommendation with final results
            # Re-fetch the recommendation in this new session
            recommendation = db.query(Recommendation).filter(
                Recommendation.id == recommendation_id
            ).first()

            if recommendation:
                recommendation.match_score = negotiation_result.match_score
                recommendation.match_reasons = negotiation_result.match_reasons
                recommendation.message = negotiation_result.conversation_summary
                db.commit()

                logger.info(
                    f"Updated recommendation {recommendation_id} with final score {negotiation_result.match_score}"
                )

            # 6. Cleanup store (optional - comment out to keep for debugging)
            # await cleanup_match_store(store_name)

            logger.info(f"Successfully completed matching for {source_listing.id} <-> {target_listing_id}")
        finally:
            # Close the second session
            db.close()

    except Exception as e:
        logger.error(f"Error in negotiation: {e}")
        db.rollback()
        raise
