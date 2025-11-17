"""
AI configuration for Gemini API.

Simple config for direct LLM calls - no agents, no MCP.
"""

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class AISettings(BaseSettings):
    """AI service configuration."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Gemini API (reads from GEMINI_API_KEY or AI_GEMINI_API_KEY)
    gemini_api_key: str = ""
    default_model: str = "gemini-2.0-flash-exp"
    default_temperature: float = 0.7
    default_max_tokens: int = 2048

    # SerpAPI for price intelligence (reads from SERPAPI_API_KEY)
    serpapi_api_key: str = ""


_settings: AISettings | None = None


def get_ai_settings() -> AISettings:
    """Get AI settings singleton."""
    global _settings
    if _settings is None:
        _settings = AISettings()
    return _settings
