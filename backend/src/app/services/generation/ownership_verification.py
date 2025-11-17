"""
Ownership Verification Service using Gemini OCR.

Verifies proof of ownership by analyzing images with user details (name + date).
Uses Gemini's vision capabilities to detect and verify text in images.
"""

import base64
import io
from datetime import datetime, timedelta
from typing import Literal
from pydantic import BaseModel, Field
from google import genai
from PIL import Image

from src.app.core.logging_config import get_logger
from src.app.services.generation.config import get_ai_settings

logger = get_logger("app.services.generation.ownership_verification")


class OwnershipVerificationResult(BaseModel):
    """Result of ownership verification check"""
    is_verified: bool = Field(description="Whether ownership proof is valid")
    detected_name: str | None = Field(description="Name detected in the image")
    detected_date: str | None = Field(description="Date detected in the image")
    confidence: Literal["high", "medium", "low"] = Field(description="Confidence level of verification")
    issues: list[str] = Field(description="List of issues found (if any)")
    suggestions: list[str] = Field(description="Suggestions to improve proof")


async def verify_ownership_proof(
    image_data_url: str,
    expected_username: str | None = None,
) -> dict:
    """
    Verify proof of ownership from an image using Gemini OCR.

    The image should contain:
    1. User's name/username
    2. Current date (within 7 days)
    3. Clear, readable text (paper/watermark)

    Args:
        image_data_url: Base64-encoded image data URL
        expected_username: Optional username to verify against

    Returns:
        dict with verification result containing:
        - is_verified: bool
        - detected_name: str | None
        - detected_date: str | None
        - confidence: "high" | "medium" | "low"
        - issues: list[str]
        - suggestions: list[str]

    Raises:
        ValueError: If API key not configured or verification fails
    """
    settings = get_ai_settings()
    if not settings.gemini_api_key:
        raise ValueError("Gemini API key not configured. Set AI_GEMINI_API_KEY in .env")

    logger.info(f"🔍 Verifying ownership proof{' for user: ' + expected_username if expected_username else ''}")

    try:
        # Initialize Gemini client
        client = genai.Client(api_key=settings.gemini_api_key)

        # Convert image data URL to PIL Image
        if ',' in image_data_url:
            img_data = image_data_url.split(',', 1)[1]
        else:
            img_data = image_data_url

        img_bytes = base64.b64decode(img_data)
        pil_image = Image.open(io.BytesIO(img_bytes))
        logger.info(f"  Loaded proof image: {pil_image.size}")

        # Get current date for validation
        current_date = datetime.now()
        date_range_start = current_date - timedelta(days=7)

        # Construct verification prompt
        prompt = f"""Analyze this proof of ownership image and extract the following information:

1. **Name/Username**: Look for any name, username, or identifier written on paper/watermark
2. **Date**: Look for a date (format could be DD/MM/YYYY, MM/DD/YYYY, or written out)
3. **Clarity**: Is the text clearly visible and readable?

Current date for reference: {current_date.strftime('%Y-%m-%d')}
Valid date range: {date_range_start.strftime('%Y-%m-%d')} to {current_date.strftime('%Y-%m-%d')} (within 7 days)

{f'Expected username: {expected_username}' if expected_username else ''}

Please analyze the image and provide:
- What name/username is visible (if any)
- What date is visible (if any), and whether it's within the valid 7-day range
- Whether this appears to be a valid proof of ownership
- Any issues or concerns
- Suggestions to improve the proof if needed

Respond in a structured format."""

        # Call Gemini with vision
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, pil_image]
        )

        # Parse the response text
        response_text = response.text.strip()
        logger.info(f"  Gemini OCR response:\n{response_text}")

        # Use Gemini to structure the response
        # Create a second call to parse the unstructured response into our structured format
        structure_prompt = f"""Based on this ownership verification analysis:

{response_text}

Determine:
1. is_verified: Should be true ONLY if:
   - A name/username is clearly visible
   - A date is visible AND within the last 7 days
   {f'- The detected name matches or is similar to: {expected_username}' if expected_username else ''}
   - The text is clear and readable

2. detected_name: The exact name/username found (or null if none)
3. detected_date: The exact date found in YYYY-MM-DD format (or null if none)
4. confidence: "high", "medium", or "low" based on image quality and clarity
5. issues: List any problems (missing name, missing date, date too old, unclear text, name mismatch, etc.)
6. suggestions: List 2-3 actionable suggestions to improve the proof

Respond with ONLY valid JSON matching this exact structure:
{{
  "is_verified": true or false,
  "detected_name": "name or null",
  "detected_date": "YYYY-MM-DD or null",
  "confidence": "high" or "medium" or "low",
  "issues": ["issue 1", "issue 2"],
  "suggestions": ["suggestion 1", "suggestion 2"]
}}"""

        structured_response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=structure_prompt
        )

        # Parse JSON response
        import json
        result_text = structured_response.text.strip()

        # Extract JSON from markdown code blocks if present
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()

        result_dict = json.loads(result_text)

        # Validate and log result
        is_verified = result_dict.get("is_verified", False)
        confidence = result_dict.get("confidence", "low")

        logger.info(f"  ✅ Verification complete: {is_verified} (confidence: {confidence})")
        if not is_verified:
            logger.info(f"  Issues: {', '.join(result_dict.get('issues', []))}")

        return result_dict

    except json.JSONDecodeError as e:
        logger.error(f"❌ Failed to parse structured response: {e}", exc_info=True)
        logger.error(f"Raw response: {result_text}")

        # Return conservative fallback
        return {
            "is_verified": False,
            "detected_name": None,
            "detected_date": None,
            "confidence": "low",
            "issues": ["Failed to analyze image properly"],
            "suggestions": [
                "Ensure the image is clear and well-lit",
                "Write your name and today's date on a piece of paper",
                "Take a photo with the paper next to your product"
            ]
        }

    except Exception as e:
        logger.error(f"❌ Failed to verify ownership proof: {e}", exc_info=True)
        raise ValueError(f"Failed to verify ownership proof: {str(e)}")
