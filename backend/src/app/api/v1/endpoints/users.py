from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from src.database import get_db
from src.models.user import User
from src.schemas.user import User as UserSchema, UserCreate

router = APIRouter()


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


@router.post("/", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user.

    NOTE: This is a simplified example. In production, you should:
    - Hash passwords properly
    - Validate email uniqueness
    - Use a service layer for business logic
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Create user (password should be hashed in production!)
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=f"hashed_{user_data.password}",  # TODO: Use proper hashing
        is_active=user_data.is_active,
        is_superuser=user_data.is_superuser,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user
