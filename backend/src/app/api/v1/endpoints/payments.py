"""
Payment endpoints for Stripe integration.
"""

import os
from typing import Any

import stripe
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class CreateCheckoutSessionRequest(BaseModel):
    """Request model for creating a Stripe checkout session."""

    amount: float | str
    title: str
    description: str | None = None
    metadata: dict[str, str] | None = None


class CreateCheckoutSessionResponse(BaseModel):
    """Response model for checkout session creation."""

    clientSecret: str


def get_stripe_client() -> stripe.Stripe:
    """Get configured Stripe client."""
    api_key = os.getenv("STRIPE_SECRET_KEY")
    if not api_key:
        raise ValueError("STRIPE_SECRET_KEY environment variable is not set")
    return stripe.Stripe(api_key=api_key)


def parse_amount(amount: float | str) -> float:
    """Parse amount from string or float."""
    if isinstance(amount, (int, float)):
        return float(amount)
    # Extract number from string like "RM 50" or "$50"
    import re

    match = re.search(r"[\d.]+", str(amount))
    if match:
        return float(match.group())
    return 0.0


@router.post("/create-checkout-session", response_model=CreateCheckoutSessionResponse)
async def create_checkout_session(request: CreateCheckoutSessionRequest) -> dict[str, Any]:
    """
    Create a Stripe checkout session for embedded checkout.

    Args:
        request: Checkout session request with amount, title, description, and metadata

    Returns:
        Client secret for the checkout session

    Raises:
        HTTPException: If amount is invalid or Stripe API fails
    """
    try:
        # Parse and validate amount
        amount_number = parse_amount(request.amount)
        if amount_number <= 0:
            raise HTTPException(status_code=400, detail="Invalid amount")

        # Get Stripe client
        stripe_client = get_stripe_client()

        # Create checkout session
        session = stripe_client.checkout.sessions.create(
            ui_mode="embedded",
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": request.title or "Purchase",
                            "description": request.description or "",
                        },
                        "unit_amount": int(amount_number * 100),  # Amount in cents
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            # Note: return_url should be passed from frontend
            # For now using a placeholder - frontend should provide this
            return_url="https://placeholder.com/payment/success?session_id={CHECKOUT_SESSION_ID}",
            metadata=request.metadata or {},
        )

        return {"clientSecret": session.client_secret}

    except stripe.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}") from e
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") from e
