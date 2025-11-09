"""
AI configuration for Gemini API.

Simple config for direct LLM calls - no agents, no MCP.
"""

import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class AISettings(BaseSettings):
    """AI service configuration."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Gemini API
    gemini_api_key: str = ""
    default_model: str = "gemini-2.0-flash-exp"
    default_temperature: float = 0.7
    default_max_tokens: int = 2048


_settings: AISettings | None = None


def get_ai_settings() -> AISettings:
    """Get AI settings singleton."""
    global _settings
    if _settings is None:
        _settings = AISettings(
            gemini_api_key=os.getenv("AI_GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY", ""),
        )
    return _settings
