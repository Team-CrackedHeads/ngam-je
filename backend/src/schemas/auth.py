"""Authentication request/response schemas."""

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """User login request schema."""

    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    """User signup/registration request schema."""

    email: EmailStr
    username: str
    password: str


class AuthResponse(BaseModel):
    """Authentication response with user info and tokens."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict  # Can be replaced with User schema if needed
