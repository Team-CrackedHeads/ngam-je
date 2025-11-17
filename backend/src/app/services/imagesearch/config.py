"""
Unsplash API Configuration.

Simple configuration for Unsplash image search service.
"""

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load environment variables from .env file
load_dotenv()


class UnsplashSettings(BaseSettings):
    """Unsplash API configuration."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Unsplash API
    unsplash_access_key: str = ""


# Singleton instance
_settings: UnsplashSettings | None = None


def get_unsplash_settings() -> UnsplashSettings:
    """Get Unsplash settings singleton."""
    global _settings
    if _settings is None:
        _settings = UnsplashSettings()
    return _settings
