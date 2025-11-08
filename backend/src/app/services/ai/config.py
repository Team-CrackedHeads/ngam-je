"""
AI Services Configuration.

Centralized configuration management for all AI services using Pydantic settings.
"""

import os
from typing import Literal
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load environment variables from .env file
load_dotenv()


class AISettings(BaseSettings):
    """AI service configuration."""

    # ========================================
    # LLM Provider Settings
    # ========================================
    gemini_api_key: str
    default_model: str = "gemini-2.5-flash"
    default_temperature: float = 0.0
    default_max_tokens: int = 2048

    # ========================================
    # MCP Settings
    # ========================================
    mcp_enabled: bool = True
    mcp_serpapi_url: str = "http://127.0.0.1:8001/sse"
    mcp_serpapi_transport: Literal["sse", "stdio"] = "sse"
    serpapi_api_key: str

    # ========================================
    # Rate Limiting
    # ========================================
    rate_limit_enabled: bool = False
    rate_limit_requests_per_minute: int = 60

    # ========================================
    # Cost Tracking
    # ========================================
    cost_tracking_enabled: bool = False

    class Config:
        env_prefix = "AI_"
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra env vars from .env file


# Singleton instance
_settings: AISettings | None = None


def get_ai_settings() -> AISettings:
    """Get AI settings singleton."""
    global _settings
    if _settings is None:
        # Fallback to direct env vars if AI_ prefix not found
        _settings = AISettings(
            gemini_api_key=os.getenv("AI_GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY", ""),
            serpapi_api_key=os.getenv("AI_SERPAPI_API_KEY") or os.getenv("SERPAPI_API_KEY", ""),
        )
    return _settings
