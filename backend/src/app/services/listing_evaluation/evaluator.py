"""
Description Feedback Agent - PydanticAI-based smart evaluator

Purpose: Evaluate user's freeform input and guide them to write better descriptions
- Analyze completeness (what, why, how)
- Identify missing information (specs, budget, condition, etc.)
- Give actionable suggestions with buy/sell context awareness
- Score quality and provide structured feedback
"""

from typing import Literal
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from src.app.core.logging_config import get_logger

logger = get_logger("app.services.listing_evaluation.feedback")

# Blocklist - in production, this would be Redis/DB
BLOCKLIST = {
    "spam", "scam", "free money", "click here", "buy now",
    "limited time", "act now", "guarantee", "risk free"
}


class CoverageAnalysis(BaseModel):
    """Coverage of key information dimensions"""
    what: bool = Field(description="Product/item clearly identified?")
    why: bool = Field(description="Purpose/intent/use-case explained?")
    how: bool = Field(description="Details like budget, specs, condition, preferences mentioned?")


class FeedbackItem(BaseModel):
    """Single feedback item in checklist"""
    status: Literal["pass", "fail", "warning"]
    label: str
    message: str


class DescriptionFeedback(BaseModel):
    """Complete feedback result from the agent"""
    completeness_score: int = Field(ge=0, le=100, description="How complete is the description (0-100)")
    coverage: CoverageAnalysis = Field(description="What dimensions are covered")
    checklist: list[FeedbackItem] = Field(description="Specific checks and their status")
    missing_info: list[str] = Field(description="What critical info is missing")
    suggestions: list[str] = Field(description="Actionable suggestions to improve")
    suggested_title: str = Field(default="", description="Suggested title based on description")
    suggested_tags: list[str] = Field(default_factory=list, description="Suggested tags/keywords")


# Context-aware system prompts for buy vs sell
BUY_SYSTEM_PROMPT = """You are a marketplace feedback agent helping buyers write better "Looking for" posts.

Analyze the user's freeform description and evaluate:
1. **WHAT** - Is the product/item type clearly identified? (e.g., "iPhone 13", "gaming laptop", "office chair")
2. **WHY** - Is the purpose/use-case explained? (e.g., "for university", "replacing broken one", "gift for wife")
3. **HOW** - Are preferences/requirements mentioned? (e.g., budget range, specs, condition, brand, color, location)

Provide:
- Completeness score (0-100)
- Coverage analysis (what/why/how booleans)
- Checklist of specific passes/warnings/failures
- Missing information list
- Actionable suggestions
- Suggested title (format: "Looking for [item]" or "WTB: [item]")
- Suggested tags

Be encouraging but specific. Help them write a description that attracts good offers."""

SELL_SYSTEM_PROMPT = """You are a marketplace feedback agent helping sellers write better "For Sale" posts.

Analyze the seller's description and evaluate:
1. **WHAT** - Is the product clearly identified? (e.g., "iPhone 13 Pro 256GB", "Herman Miller Aeron chair")
2. **WHY** - Is the reason for selling mentioned? (e.g., "upgrading", "moving", "not using anymore")
3. **HOW** - Are key details provided? (e.g., condition, age, warranty, accessories, price, photos)

Provide:
- Completeness score (0-100)
- Coverage analysis (what/why/how booleans)
- Checklist of specific passes/warnings/failures
- Missing information list
- Actionable suggestions
- Suggested title (format: "For Sale: [item]" or "WTS: [item]")
- Suggested tags

Be encouraging but specific. Help them write a description that builds buyer confidence."""


def quick_rule_check(text: str) -> dict:
    """Fast rule-based pre-checks"""
    text_lower = text.lower()
    word_count = len(text.split())
    char_count = len(text.strip())
    blocked_words = [word for word in BLOCKLIST if word in text_lower]

    return {
        "word_count": word_count,
        "char_count": char_count,
        "blocked_words": blocked_words,
        "has_minimum_length": char_count >= 10,
        "has_minimum_words": word_count >= 3,
    }


# Lazy-initialized agents (created on first use)
_buy_feedback_agent = None
_sell_feedback_agent = None


def get_buy_feedback_agent() -> Agent:
    """Get or create buy feedback agent"""
    global _buy_feedback_agent
    if _buy_feedback_agent is None:
        _buy_feedback_agent = Agent(
            'gemini-2.5-flash',
            output_type=DescriptionFeedback,
            system_prompt=BUY_SYSTEM_PROMPT,
        )
    return _buy_feedback_agent


def get_sell_feedback_agent() -> Agent:
    """Get or create sell feedback agent"""
    global _sell_feedback_agent
    if _sell_feedback_agent is None:
        _sell_feedback_agent = Agent(
            'gemini-2.5-flash',
            output_type=DescriptionFeedback,
            system_prompt=SELL_SYSTEM_PROMPT,
        )
    return _sell_feedback_agent


async def evaluate_listing_description(
    text: str,
    listing_type: Literal["buy", "sell"] = "buy"
) -> dict:
    """
    Evaluate listing description and provide actionable feedback.

    Args:
        text: User's freeform description
        listing_type: "buy" or "sell"

    Returns:
        Structured feedback with score, coverage, checklist, suggestions
    """
    logger.info(f"🔍 Evaluating {listing_type} listing ({len(text)} chars)")

    # Step 1: Quick rule-based checks
    rules = quick_rule_check(text)

    # Early returns for basic failures
    if not rules["has_minimum_length"]:
        return {
            "completeness_score": 0,
            "coverage": {"what": False, "why": False, "how": False},
            "checklist": [
                {
                    "status": "fail",
                    "label": "Length",
                    "message": "Description too short (minimum 10 characters)"
                }
            ],
            "missing_info": ["Add more details about what you're looking for"],
            "suggestions": ["Write at least a few words describing what you need"],
            "suggested_title": "",
            "suggested_tags": []
        }

    if rules["blocked_words"]:
        return {
            "completeness_score": 0,
            "coverage": {"what": False, "why": False, "how": False},
            "checklist": [
                {
                    "status": "fail",
                    "label": "Content Policy",
                    "message": f"Blocked words detected: {', '.join(rules['blocked_words'])}"
                }
            ],
            "missing_info": [],
            "suggestions": ["Remove spam/inappropriate content and rewrite"],
            "suggested_title": "",
            "suggested_tags": []
        }

    # Step 2: AI-powered smart evaluation
    try:
        agent = get_buy_feedback_agent() if listing_type == "buy" else get_sell_feedback_agent()

        prompt = f"""Analyze this {listing_type} listing description:

"{text}"

Basic stats:
- Word count: {rules['word_count']}
- Character count: {rules['char_count']}

Provide complete structured feedback."""

        result = await agent.run(prompt)
        logger.info(f"✅ Feedback complete: {result.data.completeness_score}% score")

        return result.data.model_dump()

    except Exception as e:
        logger.error(f"❌ Feedback generation failed: {e}", exc_info=True)

        # Fallback response
        return {
            "completeness_score": min(rules["word_count"] * 10, 50),  # Cap at 50 for fallback
            "coverage": {
                "what": rules["word_count"] >= 3,
                "why": False,
                "how": False
            },
            "checklist": [
                {
                    "status": "warning",
                    "label": "AI Analysis",
                    "message": "AI feedback unavailable - showing basic analysis"
                },
                {
                    "status": "pass" if rules["has_minimum_words"] else "fail",
                    "label": "Word Count",
                    "message": f"Has {rules['word_count']} words"
                }
            ],
            "missing_info": [
                "Specific product details",
                "Purpose or use case",
                "Budget or price range",
                "Preferred specs or conditions"
            ],
            "suggestions": [
                "Add more specific details about what you're looking for",
                "Mention your budget range",
                "Explain why you need this item"
            ],
            "suggested_title": "",
            "suggested_tags": []
        }
