"""
AI Negotiation Agents - PydanticAI-based buyer and seller agents
"""

import time
import asyncio
from datetime import datetime
from typing import Optional
from google import genai
from google.genai import types
from src.app.core.logging_config import get_logger
from src.models.listing import Listing
from .config import DEFAULT_CONFIG, NegotiationConfig
from .models import NegotiationResult, NegotiationMessage

logger = get_logger("app.services.matching.negotiation")


def create_buyer_prompt(wtb_listing: Listing) -> str:
    """Create system prompt for buyer agent"""
    return f"""You are negotiating to BUY on behalf of listing #{wtb_listing.id}.

**Your Budget:** ${wtb_listing.min_price:.2f} - ${wtb_listing.max_price:.2f}
**Your Needs:** {wtb_listing.description[:150]}...
**Your Location:** {wtb_listing.creator_location}
**Your Goal:** Get the best price within budget

**NEGOTIATION STRATEGY:**
1. Use File Search to review the seller's listing details (condition, description, tags, shipping, FAQs)
2. Reference SPECIFIC details from their listing to show genuine interest
3. Check their FAQs - they may have already answered common questions
4. Mention why you need this item (from your description)
5. Consider shipping options and location compatibility
6. Ask about condition, shipping cost, or other concerns NOT covered in FAQs
7. Build rapport by acknowledging the item's value/condition

**RULES:**
1. You have MAX {DEFAULT_CONFIG.MAX_TURNS} turns to reach a deal
2. Start with a reasonable offer (not your max budget)
3. If seller's price is within budget, say "I agree to $XXX" with the EXACT price
4. If price is too high and won't budge, say "No deal, too expensive"
5. Keep responses concise (2-3 sentences)
6. Always state a specific dollar amount
7. Make the conversation natural - mention product details, not just price

Be professional, friendly, and show you've read their listing. Focus on mutual benefit."""


def create_seller_prompt(wts_listing: Listing) -> str:
    """Create system prompt for seller agent"""
    return f"""You are negotiating to SELL on behalf of listing #{wts_listing.id}.

**Your Price Range:** ${wts_listing.min_price:.2f} - ${wts_listing.max_price:.2f}
**Your Item:** {wts_listing.title}
**Condition:** {wts_listing.description[:150]}...
**Your Location:** {wts_listing.creator_location}
**Shipping Options:** {', '.join(wts_listing.shipping_options) if wts_listing.shipping_options else 'Not specified'}
**Your Goal:** Sell at the best price within range

**NEGOTIATION STRATEGY:**
1. Use File Search to review the buyer's listing (their needs, budget, location, FAQs)
2. Highlight SPECIFIC features that match their needs
3. Reference answers from your FAQs if relevant to their questions
4. Mention item condition, completeness, and any extras
5. Address shipping/delivery based on their location
6. Show you understand their use case (if mentioned in their description)
7. Build trust by providing detailed, honest information from FAQs

**RULES:**
1. You have MAX {DEFAULT_CONFIG.MAX_TURNS} turns to reach a deal
2. Start with a reasonable asking price (not your minimum)
3. If buyer's offer is within range, say "I agree to $XXX" with the EXACT price
4. If offer is too low and won't improve, say "No deal, too low"
5. Keep responses concise (2-3 sentences)
6. Always state a specific dollar amount
7. Make the conversation natural - highlight value, not just defend price

Be professional, friendly, and show you understand their needs. Focus on mutual benefit."""


def price_ranges_overlap(wtb_listing: Listing, wts_listing: Listing) -> bool:
    """Check if buyer's max >= seller's min"""
    return wtb_listing.max_price >= wts_listing.min_price


def extract_price_from_message(message: str) -> Optional[float]:
    """Extract price amount from message (supports multiple currencies)"""
    import re

    # Look for patterns like MYR 560.00, $123, RM 500, etc.
    patterns = [
        r'(?:MYR|RM|USD|\$)\s*(\d+(?:[.,]\d{2})?)',  # MYR 560.00, $123, RM 500
        r'(\d+(?:[.,]\d{2})?)\s*(?:MYR|RM|USD|dollars|bucks)',  # 560.00 MYR, 123 dollars
        r'\$(\d+(?:[.,]\d{2})?)',  # $123 or $123.45
        r'(\d+(?:[.,]\d{2})?)\s*(?:dollars|bucks)',  # 123 dollars
        r'(?:^|\s)(\d+(?:[.,]\d{2})?)(?:\s|$)',  # standalone number
    ]

    for pattern in patterns:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            try:
                # Replace comma with dot for European format
                price_str = match.group(1).replace(',', '.')
                return float(price_str)
            except (ValueError, IndexError):
                continue

    return None


def check_agreement(conversation: list[NegotiationMessage]) -> tuple[bool, Optional[float]]:
    """
    Check if both parties agreed

    Returns: (agreed, final_price)
    """
    if len(conversation) < 2:
        return False, None

    # Check last 2 messages for agreement
    last_messages = conversation[-2:]

    agreed_count = 0
    final_price = None

    for msg in last_messages:
        msg_lower = msg.message.lower()
        if "i agree" in msg_lower or "deal" in msg_lower and "no deal" not in msg_lower:
            agreed_count += 1
            # Extract price from this message
            price = extract_price_from_message(msg.message)
            if price:
                final_price = price

    # Both agreed
    return agreed_count >= 2, final_price


def check_rejection(conversation: list[NegotiationMessage]) -> bool:
    """Check if either party rejected"""
    if not conversation:
        return False

    last_msg = conversation[-1].message.lower()
    return "no deal" in last_msg or "reject" in last_msg or "too expensive" in last_msg or "too low" in last_msg


async def run_ai_negotiation(
    store_name: str,
    wtb_listing: Listing,
    wts_listing: Listing,
    config: NegotiationConfig = DEFAULT_CONFIG,
) -> NegotiationResult:
    """
    Run AI-to-AI negotiation using Gemini File Search

    Returns: NegotiationResult with conversation and outcome
    """
    client = genai.Client()
    start_time = time.time()
    conversation: list[NegotiationMessage] = []

    # Pre-check: Do price ranges overlap?
    if not price_ranges_overlap(wtb_listing, wts_listing):
        logger.info(f"Price ranges don't overlap: WTB ${wtb_listing.max_price} < WTS ${wts_listing.min_price}")
        return NegotiationResult(
            agreed=False,
            final_price=None,
            termination_reason="price_ranges_incompatible",
            conversation=[],
            conversation_summary="Price ranges don't overlap - no negotiation possible",
            turn_count=0,
            duration_seconds=0,
            match_score=0.0,
        )

    buyer_prompt = create_buyer_prompt(wtb_listing)
    seller_prompt = create_seller_prompt(wts_listing)

    logger.info(f"Starting negotiation: WTB {wtb_listing.id} <-> WTS {wts_listing.id}")

    try:
        # Negotiation loop
        for turn in range(config.MAX_TURNS):
            elapsed = time.time() - start_time

            # Check timeout
            if elapsed > config.MAX_DURATION_SECONDS:
                logger.info("Negotiation timeout")
                break

            # === BUYER'S TURN ===
            try:
                if turn == 0:
                    buyer_message = buyer_prompt
                else:
                    # Build conversation history
                    history = "\n\n".join([f"{msg.role.upper()}: {msg.message}" for msg in conversation])
                    buyer_message = f"{buyer_prompt}\n\n**CONVERSATION SO FAR:**\n{history}\n\n**Your turn - respond to the seller's latest message:**"

                buyer_response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=buyer_message,
                    config=types.GenerateContentConfig(
                        tools=[
                            types.Tool(
                                file_search=types.FileSearch(
                                    file_search_store_names=[store_name]
                                )
                            )
                        ],
                        max_output_tokens=config.MAX_TOKENS_PER_TURN,
                        thinking_config=types.ThinkingConfig(thinking_budget=0),  # Disable thinking
                    ),
                )

                # Extract text from response (handle different response formats)
                buyer_text = buyer_response.text if hasattr(buyer_response, 'text') and buyer_response.text else str(buyer_response)

                if not buyer_text or buyer_text == "None":
                    logger.error(f"Buyer response has no text: {buyer_response}")
                    break

                buyer_msg = NegotiationMessage(
                    role="buyer",
                    message=buyer_text,
                    turn=turn * 2,
                    timestamp=datetime.now(),
                )
                conversation.append(buyer_msg)
                logger.info(f"Buyer (turn {turn}): {buyer_msg.message}")

            except Exception as e:
                logger.error(f"Buyer agent error: {e}")
                break

            # Check for agreement/rejection
            agreed, price = check_agreement(conversation)
            if agreed:
                logger.info(f"Agreement reached at ${price}")
                break

            if check_rejection(conversation):
                logger.info("Negotiation rejected")
                break

            # === SELLER'S TURN ===
            try:
                if turn == 0:
                    seller_message = seller_prompt
                else:
                    # Build conversation history
                    history = "\n\n".join([f"{msg.role.upper()}: {msg.message}" for msg in conversation])
                    seller_message = f"{seller_prompt}\n\n**CONVERSATION SO FAR:**\n{history}\n\n**Your turn - respond to the buyer's latest message:**"

                seller_response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=seller_message,
                    config=types.GenerateContentConfig(
                        tools=[
                            types.Tool(
                                file_search=types.FileSearch(
                                    file_search_store_names=[store_name]
                                )
                            )
                        ],
                        max_output_tokens=config.MAX_TOKENS_PER_TURN,
                        thinking_config=types.ThinkingConfig(thinking_budget=0),  # Disable thinking
                    ),
                )

                # Extract text from response (handle different response formats)
                seller_text = seller_response.text if hasattr(seller_response, 'text') and seller_response.text else str(seller_response)

                if not seller_text or seller_text == "None":
                    logger.error(f"Seller response has no text: {seller_response}")
                    break

                seller_msg = NegotiationMessage(
                    role="seller",
                    message=seller_text,
                    turn=turn * 2 + 1,
                    timestamp=datetime.now(),
                )
                conversation.append(seller_msg)
                logger.info(f"Seller (turn {turn}): {seller_msg.message}")

            except Exception as e:
                logger.error(f"Seller agent error: {e}")
                break

            # Check for agreement/rejection after seller
            agreed, price = check_agreement(conversation)
            if agreed:
                logger.info(f"Agreement reached at ${price}")
                break

            if check_rejection(conversation):
                logger.info("Negotiation rejected")
                break

    except Exception as e:
        logger.error(f"Negotiation error: {e}")

    # Analyze result
    duration = time.time() - start_time
    agreed, final_price = check_agreement(conversation)
    rejected = check_rejection(conversation)

    if agreed:
        termination_reason = "agreement_reached"
        match_score = 90.0  # High score for agreement
        if final_price:
            summary = f"Agreement reached at ${final_price:.2f} after {len(conversation)} messages"
        else:
            summary = f"Agreement reached after {len(conversation)} messages (price extraction failed)"
    elif rejected:
        termination_reason = "rejected"
        match_score = 20.0  # Low score for rejection
        summary = f"No agreement - negotiation rejected after {len(conversation)} messages"
    elif len(conversation) >= config.MAX_TURNS * 2:
        termination_reason = "max_turns_reached"
        match_score = 40.0
        summary = f"No agreement - max turns reached ({len(conversation)} messages)"
    else:
        termination_reason = "timeout"
        match_score = 30.0
        summary = f"No agreement - timeout after {len(conversation)} messages"

    logger.info(f"Negotiation complete: {termination_reason}, score: {match_score}")

    return NegotiationResult(
        agreed=agreed,
        final_price=final_price,
        termination_reason=termination_reason,
        conversation=conversation,
        conversation_summary=summary,
        turn_count=len(conversation),
        duration_seconds=duration,
        match_score=match_score,
    )
