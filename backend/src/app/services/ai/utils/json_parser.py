"""JSON parsing utilities for AI responses."""

import re
import json
from typing import Any, Dict


def clean_text_output(text: str) -> str:
    """
    Clean AI-generated text output by removing markdown code blocks.

    Args:
        text: Raw text from AI

    Returns:
        Cleaned text
    """
    text = text.strip()
    text = re.sub(r"^(```json|```|~~~json|~~~)", "", text, flags=re.IGNORECASE)
    text = re.sub(r"(```|~~~)$", "", text)
    return text.strip()


def safe_parse_json(raw_output: str) -> Dict[str, Any]:
    """
    Safely parse JSON from AI output, handling various formats.

    Args:
        raw_output: Raw output from AI (may contain markdown, extra text, etc.)

    Returns:
        Parsed JSON as dictionary

    Raises:
        ValueError: If no valid JSON found
    """
    if isinstance(raw_output, dict):
        return raw_output

    if isinstance(raw_output, str):
        # Try to find JSON in markdown code blocks
        match = re.search(r"```json\s*({.*?})\s*```", raw_output, re.DOTALL)

        if not match:
            # Fallback: find the first {...} block
            match = re.search(r"(\{.*\})", raw_output, re.DOTALL)

        if not match:
            print("No JSON detected in AI output:\n", raw_output[:400])
            raise ValueError("AI output does not contain valid JSON")

        raw_output = match.group(1).strip()

        try:
            parsed = json.loads(raw_output)
        except json.JSONDecodeError as e:
            raise ValueError(f"AI output is not valid JSON: {e}")

        return parsed

    raise ValueError(f"Unexpected output type: {type(raw_output)}")
