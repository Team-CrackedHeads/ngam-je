"""
KYC verification endpoints.

Handles initiation of KYC verification, status checks, and Didit webhooks.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from src.app.api.deps import get_current_user, get_db

from src.app.core.config import get_settings
from src.app.services.kyc import didit_service
from src.models.user import User

router = APIRouter()
settings = get_settings()


@router.post("/initiate")
async def initiate_kyc_verification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Initiate KYC verification for the current user.

    Creates a Didit verification session and returns the verification URL.
    """
    # Check if user already has KYC in progress or verified
    if current_user.kyc_status == "verified":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="KYC already verified",
        )

    if current_user.kyc_status == "in_progress" and current_user.kyc_session_id:
        # Return existing session if still in progress
        try:
            status_data = await didit_service.get_verification_status(current_user.kyc_session_id)
            # If session is still valid, return it
            if status_data.get("status") in ["pending", "in_progress"]:
                # Use session_token to construct verification URL
                verification_url = f"https://verify.didit.me/session/{current_user.kyc_session_token}"
                return {
                    "message": "KYC verification already in progress",
                    "verification_url": verification_url,
                    "session_id": current_user.kyc_session_id,
                    "kyc_status": current_user.kyc_status,
                }
        except Exception:
            # Session might be expired or invalid, reset and create a new one
            current_user.kyc_status = "pending"
            current_user.kyc_session_id = None
            current_user.kyc_session_token = None
            current_user.kyc_initiated_at = None
            db.commit()

    # Get webhook callback URL from settings
    callback_url = settings.DIDIT_CALLBACK_URL
    if not callback_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="DIDIT_CALLBACK_URL is not configured",
        )

    # Create Didit verification session
    try:
        session_data = await didit_service.create_verification_session(
            user_id=current_user.id,
            email=current_user.email,
            callback_url=callback_url,
            metadata={
                "username": current_user.username,
                "clerk_user_id": current_user.clerk_user_id,
            },
        )

        # Update user's KYC status, session ID, and session token
        current_user.kyc_status = "in_progress"
        current_user.kyc_session_id = session_data["session_id"]
        current_user.kyc_session_token = session_data["session_token"]
        current_user.kyc_initiated_at = datetime.now(timezone.utc)
        db.commit()

        return {
            "message": "KYC verification session created",
            "verification_url": session_data["verification_url"],
            "session_id": session_data["session_id"],
            "kyc_status": "in_progress",
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create KYC session: {str(e)}",
        )


@router.get("/status")
async def get_kyc_status(
    current_user: User = Depends(get_current_user),
):
    """Get the current KYC verification status for the user."""
    return {
        "kyc_status": current_user.kyc_status,
        "kyc_session_id": current_user.kyc_session_id,
        "kyc_verified_at": current_user.kyc_verified_at,
    }


@router.get("/webhook")
@router.post("/webhook")
async def didit_webhook(
    request: Request,
    db: Session = Depends(get_db),
    # GET parameters
    verificationSessionId: str | None = None,
    verification_status: str | None = None,  # Renamed to avoid conflict with status module
):
    """
    Receive webhook notifications from Didit when verification status changes.

    This endpoint must be publicly accessible and configured in Didit dashboard.
    Didit sends webhooks as GET requests with query parameters.
    """
    # Handle GET request (Didit sends status via query params)
    if request.method == "GET":
        # Didit sends it as 'status' but we capture it as 'verification_status'
        # Also check for 'status' param if sent that way
        status_value = verification_status or request.query_params.get("status")

        if not verificationSessionId or not status_value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing verificationSessionId or status",
            )

        data = {
            "session_id": verificationSessionId,
            "status": status_value.lower(),
            "decision": {
                "status": "approved" if status_value.lower() == "approved" else "rejected"
            },
        }
    else:
        # Handle POST request (for future compatibility)
        # Get raw body and signature
        body = await request.body()
        signature = request.headers.get("x-signature", "")

        # Verify webhook signature
        if signature and not didit_service.verify_webhook_signature(
            body.decode("utf-8"), signature
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid webhook signature",
            )

        # Parse webhook data
        data = await request.json()

    # Extract important fields
    session_id = data.get("session_id")
    vendor_data = data.get("vendor_data")  # Our user ID (optional)
    verification_status = data.get("status")  # e.g., "verified", "failed", "approved"
    decision = data.get("decision", {})  # Additional verification decision data

    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing session_id in webhook data",
        )

    # Find user by session ID
    user = db.query(User).filter(User.kyc_session_id == session_id).first()

    if not user:
        # Could also try finding by vendor_data (user_id)
        try:
            user_id = int(vendor_data)
            user = db.query(User).filter(User.id == user_id).first()
        except (ValueError, TypeError):
            pass

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found for this session",
        )

    # Update user's KYC status based on Didit's decision
    if verification_status == "verified" or decision.get("status") == "approved":
        user.kyc_status = "verified"
        user.kyc_verified_at = datetime.now(timezone.utc)
    elif verification_status == "failed" or decision.get("status") == "rejected":
        user.kyc_status = "failed"
    else:
        # Other statuses: pending, in_progress, etc.
        user.kyc_status = verification_status

    db.commit()

    return {"message": "Webhook processed successfully", "user_id": user.id}
