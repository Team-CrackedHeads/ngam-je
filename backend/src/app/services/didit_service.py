"""
Didit KYC service for identity verification.

Handles creation of KYC sessions, verification status, and webhook signature validation.
"""

import hmac
import hashlib
import httpx
from typing import Optional
from datetime import datetime

from src.app.core.config import get_settings

settings = get_settings()


class DiditService:
    """Service for interacting with Didit KYC API."""

    def __init__(self):
        self.base_url = settings.DIDIT_BASE_URL
        self.api_key = settings.DIDIT_API_KEY
        self.webhook_secret = settings.DIDIT_WEBHOOK_SECRET
        self.workflow_id = settings.DIDIT_WORKFLOW_ID
        # ============================================================================
        # TEMPORARY: KYC Bypass Mode for Development
        # TODO: Remove this section before production deployment
        # ============================================================================
        self.skip_verification = settings.KYC_SKIP_VERIFICATION
        # ============================================================================

    async def create_verification_session(
        self,
        user_id: int,
        email: str,
        callback_url: str,
        metadata: Optional[dict] = None,
    ) -> dict:
        """
        Create a new KYC verification session for a user.

        Args:
            user_id: Internal user ID to track in vendor_data
            email: User's email address
            callback_url: URL for Didit to send webhook notifications
            metadata: Additional metadata to attach to the session

        Returns:
            dict with session_id, session_token, and verification_url

        Raises:
            httpx.HTTPStatusError: If the API request fails
        """
        # ============================================================================
        # TEMPORARY: KYC Bypass Mode for Development
        # TODO: Remove this section before production deployment
        # ============================================================================
        if self.skip_verification:
            # Return mock session data for development
            mock_session_id = f"mock_session_{user_id}_{int(datetime.now().timestamp())}"
            return {
                "session_id": mock_session_id,
                "session_token": "mock_token",
                "verification_url": f"https://mock-verify.local/session/{mock_session_id}",
                "raw_response": {"mock": True, "note": "KYC verification bypassed for development"},
            }
        # ============================================================================

        url = f"{self.base_url}/v2/session/"
        headers = {
            "X-Api-Key": self.api_key,
            "Content-Type": "application/json",
        }

        # Debug logging
        print(f"DEBUG - Didit API URL: {url}")
        print(f"DEBUG - API Key (first 10 chars): {self.api_key[:10]}...")
        print(f"DEBUG - Workflow ID: {self.workflow_id}")

        payload = {
            "workflow_id": self.workflow_id,
            "callback": callback_url,
            "vendor_data": str(user_id),  # Track our internal user ID
            "contact_details": {
                "email": email,
                "language": "en",
            },
        }

        if metadata:
            payload["metadata"] = metadata

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

        # Extract key information
        session_id = data.get("session_id")
        session_token = data.get("session_token")
        verification_url = f"https://verify.didit.me/session/{session_token}"

        return {
            "session_id": session_id,
            "session_token": session_token,
            "verification_url": verification_url,
            "raw_response": data,
        }

    async def get_verification_status(self, session_id: str) -> dict:
        """
        Retrieve the current status of a verification session.

        Args:
            session_id: The Didit session ID

        Returns:
            dict with verification status and decision

        Raises:
            httpx.HTTPStatusError: If the API request fails
        """
        # ============================================================================
        # TEMPORARY: KYC Bypass Mode for Development
        # TODO: Remove this section before production deployment
        # ============================================================================
        if self.skip_verification or session_id.startswith("mock_session_"):
            # Return mock status for development
            return {
                "status": "pending",
                "decision": {"status": "pending"},
                "mock": True,
            }
        # ============================================================================

        url = f"{self.base_url}/v2/session/{session_id}/decision/"
        headers = {
            "X-Api-Key": self.api_key,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()

    def verify_webhook_signature(self, payload: str, signature: str) -> bool:
        """
        Verify that a webhook request came from Didit.

        Args:
            payload: Raw request body as string
            signature: Value from x-signature header

        Returns:
            True if signature is valid, False otherwise
        """
        if not self.webhook_secret:
            raise ValueError("DIDIT_WEBHOOK_SECRET is not configured")

        # Compute expected signature using HMAC-SHA256
        expected_signature = hmac.new(
            self.webhook_secret.encode("utf-8"),
            payload.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        # Constant-time comparison to prevent timing attacks
        return hmac.compare_digest(signature, expected_signature)


# Singleton instance
didit_service = DiditService()
