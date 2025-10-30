"""Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.app.api.deps import get_current_user
from src.app.core.security import verify_token
from src.app.services.auth_service import AuthService
from src.database import get_db
from src.schemas.auth import AuthResponse, LoginRequest, SignupRequest
from src.schemas.token import RefreshTokenRequest, Token
from src.schemas.user import User

router = APIRouter()


@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK)
def login(login_data: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    """
    Login with email and password.

    Returns JWT access and refresh tokens.
    """
    user = AuthService.authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    tokens = AuthService.create_user_tokens(user)

    return AuthResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type="bearer",
        user={
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_active": user.is_active,
        },
    )


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(signup_data: SignupRequest, db: Session = Depends(get_db)) -> AuthResponse:
    """
    Register a new user account.

    Returns JWT access and refresh tokens.
    """
    try:
        user = AuthService.register_user(db, signup_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    tokens = AuthService.create_user_tokens(user)

    return AuthResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type="bearer",
        user={
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_active": user.is_active,
        },
    )


@router.get("/me", response_model=User, status_code=status.HTTP_200_OK)
def get_current_user_info(current_user: User = Depends(get_current_user)) -> User:
    """
    Get current authenticated user information.

    Requires valid JWT access token.
    """
    return current_user


@router.post("/refresh", response_model=Token, status_code=status.HTTP_200_OK)
def refresh_access_token(
    refresh_data: RefreshTokenRequest, db: Session = Depends(get_db)
) -> Token:
    """
    Refresh access token using refresh token.

    Returns a new access token and refresh token.
    """
    payload = verify_token(refresh_data.refresh_token, token_type="refresh")

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # Verify user still exists and is active
    from src.models.user import User as UserModel

    user = db.query(UserModel).filter(UserModel.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    tokens = AuthService.create_user_tokens(user)

    return Token(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type="bearer",
    )
