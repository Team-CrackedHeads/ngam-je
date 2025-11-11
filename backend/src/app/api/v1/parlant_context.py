"""API endpoints for Parlant session context management."""

from fastapi import APIRouter
from pydantic import BaseModel

from parlant_service.context_store import set_listing_type

router = APIRouter()


class SessionContextRequest(BaseModel):
    """Request model for setting session context."""
    session_id: str
    listing_type: str  # "buy" or "sell"


@router.post("/parlant/context")
async def set_session_context(request: SessionContextRequest):
    """
    Store the listing type context for a Parlant session.
    This allows the agent to know which type of listing the user is creating.
    """
    set_listing_type(request.session_id, request.listing_type)
    return {"success": True, "session_id": request.session_id, "listing_type": request.listing_type}
