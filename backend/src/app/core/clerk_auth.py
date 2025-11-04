"""
Clerk authentication utilities.

Uses the official Clerk Backend SDK for token verification and user management.
"""

from typing import Optional
from clerk_backend_api import Clerk, AuthenticateRequestOptions, authenticate_request

from src.app.core.config import get_settings

settings = get_settings()

# Initialize Clerk SDK with secret key
clerk_client = Clerk(bearer_auth=settings.CLERK_SECRET_KEY)


def verify_clerk_token(token: str) -> Optional[dict]:
    """
    Verify a Clerk JWT token using the official Clerk SDK.

    The Clerk SDK's authenticate_request() function expects a request object
    with headers. We create a minimal request-like object to satisfy this interface.

    Args:
        token: JWT token string from Authorization header

    Returns:
        Token payload dict if valid, None if invalid
    """
    try:
        # The Clerk SDK's authenticate_request expects a request-like object with headers
        # We create a simple object that provides the required interface
        class RequestAdapter:
            """Adapts our token string to the request interface expected by Clerk SDK."""
            def __init__(self, token: str):
                # Clerk SDK checks for 'authorization' header (case-sensitive)
                # Provide both to be safe with different HTTP implementations
                self.headers = {
                    "authorization": f"Bearer {token}",
                    "Authorization": f"Bearer {token}",
                }
                self.cookies = {}

        request = RequestAdapter(token)

        # Use Clerk's official JWT verification via authenticate_request
        request_state = authenticate_request(
            request,
            AuthenticateRequestOptions(
                secret_key=settings.CLERK_SECRET_KEY,
                authorized_parties=None,  # Accept tokens from any frontend origin
            )
        )

        # Debug: log if auth failed
        if not request_state.is_signed_in:
            print(f"Auth failed - reason: {request_state.reason}, message: {request_state.message}")

        # Return the payload if authentication succeeded
        if request_state.is_signed_in and request_state.payload:
            return request_state.payload

        return None

    except Exception as e:
        print(f"Error verifying Clerk token: {e}")
        import traceback
        traceback.print_exc()
        return None
