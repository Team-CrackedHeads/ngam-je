"""
Listing Analyzer Service

Orchestrates Reporter and Moderator PydanticAI agents in-process.
Ensures no infinite loops - each agent called exactly once.
"""

import sys
import os
from typing import Dict
from src.app.core.logging_config import get_logger

# Add agent paths to Python path
reporter_path = os.path.join(os.path.dirname(__file__), "../../../listing_reporter_agent")
moderator_path = os.path.join(os.path.dirname(__file__), "../../../listing_moderator_agent")
sys.path.insert(0, reporter_path)
sys.path.insert(0, moderator_path)

from reporter_agent import analyze_listing as reporter_analyze
from moderator_agent import review_listing, ReporterData

logger = get_logger("app.services.generation.listing_analyzer")


async def analyze_listing_with_agents(
    freeform_text: str,
    listing_type: str = "buy"
) -> Dict:
    """
    Analyze listing using Reporter → Moderator flow (in-process)

    Flow:
    1. Call Reporter agent (rule-based analysis) - ONCE
    2. Call Moderator agent with Reporter's data (smart review) - ONCE
    3. Return combined result

    Args:
        freeform_text: User's input text
        listing_type: "buy" or "sell"

    Returns:
        Combined analysis with completeness score, suggestions, and insights
    """
    logger.info(f"🔍 Analyzing {listing_type} listing ({len(freeform_text)} chars)")

    try:
        # Step 1: Call Reporter Agent (ONCE)
        logger.info("📊 Step 1: Calling Reporter agent...")
        reporter_result = await reporter_analyze(freeform_text, listing_type)

        # Step 2: Call Moderator Agent (ONCE) with Reporter's data
        logger.info("🎓 Step 2: Calling Moderator agent...")
        moderator_input = ReporterData(
            basic_score=reporter_result.basic_score,
            coverage_what=reporter_result.coverage.what,
            coverage_why=reporter_result.coverage.why,
            coverage_how=reporter_result.coverage.how,
            products=reporter_result.extracted.products,
            specs=reporter_result.extracted.specs,
            prices=reporter_result.extracted.prices,
            word_count=reporter_result.extracted.word_count,
            is_detailed=reporter_result.extracted.is_detailed,
            flags=reporter_result.flags,
            input_text=reporter_result.input_text,
            listing_type=reporter_result.listing_type
        )
        moderator_result = await review_listing(moderator_input)

        # Step 3: Combine results
        logger.info("✅ Analysis complete")
        return format_final_response(reporter_result, moderator_result)

    except Exception as e:
        logger.error(f"❌ Error analyzing listing: {e}", exc_info=True)
        return get_fallback_response(freeform_text, listing_type)


def format_final_response(reporter_result, moderator_result) -> Dict:
    """Combine Reporter and Moderator results into UI-friendly format"""
    return {
        "completeness": moderator_result.adjusted_score,
        "coverage": {
            "what": reporter_result.coverage.what,
            "why": reporter_result.coverage.why,
            "how": reporter_result.coverage.how,
        },
        "suggestions": {
            "title": moderator_result.suggested_title,
            "description": moderator_result.suggested_description,
            "tags": moderator_result.tags
        },
        "missing": moderator_result.missing_info,
        "moderator_insight": moderator_result.moderator_insight,
        "market_context": moderator_result.market_context,
        "warnings": moderator_result.warnings,
        "basic_score": reporter_result.basic_score,
        "moderator_score": moderator_result.adjusted_score
    }


def get_fallback_response(text: str, listing_type: str) -> Dict:
    """Return basic response if agents fail"""
    return {
        "completeness": 0,
        "coverage": {"what": False, "why": False, "how": False},
        "suggestions": {"title": "", "description": "", "tags": []},
        "missing": [
            "Tell us what you're looking for",
            "Explain why you need it",
            "Describe your preferences (brand, specs, budget)"
        ],
        "moderator_insight": "",
        "market_context": "",
        "warnings": ["Analysis failed - please try again"],
        "basic_score": 0,
        "moderator_score": 0
    }
