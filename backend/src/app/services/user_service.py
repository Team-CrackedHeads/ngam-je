"""
User service layer.

Business logic for user operations. This separates business logic
from API routes and database models.

Pattern:
- API routes handle HTTP requests/responses
- Services contain business logic
- Models define database structure
"""

from sqlalchemy.orm import Session
from typing import Optional, List

from src.models.user import User
from src.schemas.user import UserCreate, UserUpdate


class UserService:
    """Service for user-related business logic."""

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """
        Get a user by ID.

        Args:
            db: Database session
            user_id: User ID to lookup

        Returns:
            User object or None if not found
        """
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """
        Get a user by email.

        Args:
            db: Database session
            email: Email to lookup

        Returns:
            User object or None if not found
        """
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def list_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """
        List all users with pagination.

        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of User objects
        """
        return db.query(User).offset(skip).limit(limit).all()

    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """
        Create a new user.

        Args:
            db: Database session
            user_data: User creation data

        Returns:
            Created User object

        Raises:
            ValueError: If email already exists

        TODO: Implement proper password hashing (bcrypt, argon2, etc.)
        """
        # Check if email already exists
        existing_user = UserService.get_user_by_email(db, user_data.email)
        if existing_user:
            raise ValueError(f"Email {user_data.email} already registered")

        # Create user with hashed password
        # TODO: Replace with proper password hashing!
        hashed_password = f"hashed_{user_data.password}"

        user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password,
            is_active=user_data.is_active,
            is_superuser=user_data.is_superuser,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def update_user(db: Session, user_id: int, user_data: UserUpdate) -> Optional[User]:
        """
        Update an existing user.

        Args:
            db: Database session
            user_id: User ID to update
            user_data: Updated user data

        Returns:
            Updated User object or None if not found
        """
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return None

        # Update only provided fields
        update_data = user_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if field == "password":
                # Hash password if provided
                user.hashed_password = f"hashed_{value}"  # TODO: Use proper hashing
            else:
                setattr(user, field, value)

        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        """
        Delete a user.

        Args:
            db: Database session
            user_id: User ID to delete

        Returns:
            True if deleted, False if not found
        """
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return False

        db.delete(user)
        db.commit()

        return True
