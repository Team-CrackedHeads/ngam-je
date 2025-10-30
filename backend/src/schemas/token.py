"""Authentication token schemas."""

from pydantic import BaseModel


class Token(BaseModel):
    """JWT token response schema."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """JWT token payload schema."""

    sub: str | None = None  # Subject (user ID)
    exp: int | None = None  # Expiration timestamp
    type: str | None = None  # Token type (access/refresh)


class RefreshTokenRequest(BaseModel):
    """Request schema for refreshing access token."""

    refresh_token: str
