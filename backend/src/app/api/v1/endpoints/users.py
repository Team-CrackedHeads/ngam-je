from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from src.app.api.deps import get_current_user
from src.database import get_db
from src.models.user import User
from src.schemas.user import User as UserSchema

router = APIRouter()

# KYC session expiry time (15 minutes for production)
KYC_EXPIRY_SECONDS = 900


@router.get("/me", response_model=UserSchema)
async def get_my_profile(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """
    Get current authenticated user's profile.

    Requires Clerk authentication token.
    """
    # Auto-reset expired KYC sessions
    if current_user.kyc_status == "in_progress":
        if (
            not current_user.kyc_initiated_at
            or (datetime.now(timezone.utc) - current_user.kyc_initiated_at).total_seconds()
            > KYC_EXPIRY_SECONDS
        ):
            current_user.kyc_status = "pending"
            current_user.kyc_session_id = None
            current_user.kyc_session_token = None
            current_user.kyc_initiated_at = None
            db.commit()

    return current_user


@router.get("/", response_model=List[UserSchema])
async def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    List all users.

    Example endpoint demonstrating database queries.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=UserSchema)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Get a specific user by ID.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"User {user_id} not found"
        )
    return user


# NOTE: User creation is handled by Clerk authentication.
# Users are automatically created in the database when they first authenticate.
# See get_or_create_user_from_clerk() in src/app/api/deps.py
