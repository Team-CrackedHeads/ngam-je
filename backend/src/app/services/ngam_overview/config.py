"""Configuration for Ngam Overview service."""

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class NgamOverviewSettings(BaseSettings):
    """Settings for Ngam Overview AI agent."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Google Gemini API
    gemini_api_key: str = ""

    # SerpAPI for web search
    serpapi_api_key: str = ""

    # Model configuration
    model_name: str = "gemini-2.5-flash"
    max_search_results: int = 10


@lru_cache
def get_ngam_settings() -> NgamOverviewSettings:
    """Get cached Ngam Overview settings."""
    return NgamOverviewSettings()
