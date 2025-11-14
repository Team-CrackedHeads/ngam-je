"""
Listing Description Evaluator - Hybrid Rule-Based + AI

Architecture:
1. Rule-based checks (instant): length, word count, blocklist
2. PydanticAI agent (smart): context understanding, suggestions
3. Returns structured checklist for UI
"""

import re
from typing import Literal
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from src.app.core.logging_config import get_logger

logger = get_logger("app.services.generation.listing_evaluator")

# Blocklist - in production, this would be Redis
BLOCKLIST = {
    "spam", "scam", "free money", "click here", "buy now",
    "limited time", "act now", "guarantee", "risk free"
}


class ChecklistItem(BaseModel):
    """Single checklist item"""
    status: Literal["pass", "fail", "warning"]
    label: str
    message: str


class EvaluationResult(BaseModel):
    """Complete evaluation result"""
    score: int = Field(ge=0, le=100, description="Overall quality score")
    checklist: list[ChecklistItem]
    suggestions: list[str] = Field(description="Actionable suggestions")
    suggested_title: str = ""
    suggested_tags: list[str] = []


# Rule-based checks (instant)
def rule_based_check(text: str) -> dict:
    """Fast rule-based validation"""
    text_lower = text.lower()
    word_count = len(text.split())
    char_count = len(text.strip())

    # Check blocklist
    blocked_words = [word for word in BLOCKLIST if word in text_lower]

    return {
        "word_count": word_count,
        "char_count": char_count,
        "blocked_words": blocked_words,
        "has_minimum_length": char_count >= 10,
        "has_minimum_words": word_count >= 3,
    }


# PydanticAI Agent for smart evaluation
evaluation_agent = Agent(
    'gemini-2.5-flash',
    output_type=EvaluationResult,
    system_prompt="""You are a marketplace listing quality evaluator.

Analyze user descriptions for marketplace listings and provide:
1. Quality score (0-100)
2. Checklist of what's good/missing/needs improvement
3. Actionable suggestions
4. Suggested title and tags

Focus on:
- WHAT: Product type clearly identified?
- WHY: Intent/use case explained?
- HOW: Budget, specs, preferences mentioned?

Be helpful and specific.""",
)


async def evaluate_listing_description(
    text: str,
    listing_type: Literal["buy", "sell"] = "buy"
) -> dict:
    """
    Evaluate listing description with hybrid approach.

    Args:
        text: User's description
        listing_type: "buy" or "sell"

    Returns:
        Evaluation result with checklist and suggestions
    """
    logger.info(f"🔍 Evaluating {listing_type} listing ({len(text)} chars)")

    # Step 1: Rule-based checks (instant)
    rules = rule_based_check(text)

    # Early return if fails basic rules
    if not rules["has_minimum_length"]:
        return {
            "score": 0,
            "checklist": [
                {
                    "status": "fail",
                    "label": "Length",
                    "message": "Description too short (minimum 10 characters)"
                }
            ],
            "suggestions": ["Add more details about what you're looking for"],
            "suggested_title": "",
            "suggested_tags": []
        }

    if rules["blocked_words"]:
        return {
            "score": 0,
            "checklist": [
                {
                    "status": "fail",
                    "label": "Content Policy",
                    "message": f"Blocked words detected: {', '.join(rules['blocked_words'])}"
                }
            ],
            "suggestions": ["Remove spam/inappropriate content"],
            "suggested_title": "",
            "suggested_tags": []
        }

    # Step 2: AI evaluation (smart)
    try:
        prompt = f"""Evaluate this {listing_type} listing description:

"{text}"

Basic stats:
- Word count: {rules['word_count']}
- Character count: {rules['char_count']}

Provide a complete evaluation with checklist and suggestions."""

        result = await evaluation_agent.run(prompt)

        logger.info(f"✅ Evaluation complete: {result.data.score}% score")

        return result.data.model_dump()

    except Exception as e:
        logger.error(f"❌ Evaluation failed: {e}", exc_info=True)
        # Fallback to basic response
        return {
            "score": rules["word_count"] * 10,  # Simple score
            "checklist": [
                {
                    "status": "pass" if rules["has_minimum_words"] else "fail",
                    "label": "Word Count",
                    "message": f"Has {rules['word_count']} words"
                }
            ],
            "suggestions": ["AI evaluation unavailable - showing basic analysis"],
            "suggested_title": "",
            "suggested_tags": []
        }
