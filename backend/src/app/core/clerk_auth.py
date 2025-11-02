"""
Clerk authentication utilities.

Validates JWT tokens issued by Clerk.
"""

import jwt
import requests
from functools import lru_cache
from typing import Optional

from src.app.core.config import get_settings

settings = get_settings()


@lru_cache(maxsize=1)
def get_clerk_jwks() -> dict:
    """
    Fetch Clerk's JWKS (JSON Web Key Set) for JWT verification.

    Cached to avoid repeated requests.
    """
    # Prioritize CLERK_FRONTEND_API if set (most reliable method)
    if settings.CLERK_FRONTEND_API:
        jwks_url = f"{settings.CLERK_FRONTEND_API}/.well-known/jwks.json"
    else:
        raise ValueError(
            "CLERK_FRONTEND_API must be set in environment variables. "
            "Get it from Clerk Dashboard → API Keys → Show API URLs → Frontend API"
        )

    response = requests.get(jwks_url, timeout=10)
    response.raise_for_status()
    return response.json()


def verify_clerk_token(token: str) -> Optional[dict]:
    """
    Verify a Clerk JWT token and return the payload.

    Args:
        token: JWT token string

    Returns:
        Token payload dict if valid, None if invalid
    """
    try:
        # Get JWKS from Clerk
        jwks = get_clerk_jwks()

        # Decode token header to get the key ID (kid)
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        # Find the matching key in JWKS
        signing_key = None
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                signing_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                break

        if not signing_key:
            return None

        # Verify and decode the token
        payload = jwt.decode(
            token,
            key=signing_key,
            algorithms=["RS256"],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_iat": True,
            }
        )

        return payload

    except jwt.ExpiredSignatureError:
        print("Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Invalid token: {e}")
        return None
    except Exception as e:
        print(f"Error verifying Clerk token: {e}")
        return None
