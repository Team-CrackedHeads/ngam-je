"""Authentication service layer."""

from sqlalchemy.orm import Session

from src.app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
)
from src.models.user import User
from src.schemas.auth import LoginRequest, SignupRequest
from src.schemas.user import UserCreate


class AuthService:
    """Service for authentication-related business logic."""

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User | None:
        """
        Authenticate a user with email and password.

        Args:
            db: Database session
            email: User email
            password: Plain text password

        Returns:
            User object if authentication successful, None otherwise
        """
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user

    @staticmethod
    def create_user_tokens(user: User) -> dict[str, str]:
        """
        Create access and refresh tokens for a user.

        Args:
            user: User object

        Returns:
            Dictionary with access_token and refresh_token
        """
        token_data = {"sub": str(user.id), "email": user.email}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token({"sub": str(user.id)})

        return {"access_token": access_token, "refresh_token": refresh_token}

    @staticmethod
    def register_user(db: Session, signup_data: SignupRequest) -> User:
        """
        Register a new user.

        Args:
            db: Database session
            signup_data: Signup request data

        Returns:
            Created User object

        Raises:
            ValueError: If email or username already exists
        """
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == signup_data.email).first()
        if existing_user:
            raise ValueError(f"Email {signup_data.email} already registered")

        # Check if username already exists
        existing_username = (
            db.query(User).filter(User.username == signup_data.username).first()
        )
        if existing_username:
            raise ValueError(f"Username {signup_data.username} already taken")

        # Create user with hashed password
        hashed_password = get_password_hash(signup_data.password)

        user = User(
            email=signup_data.email,
            username=signup_data.username,
            hashed_password=hashed_password,
            is_active=True,
            is_superuser=False,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user
