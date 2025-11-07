"""LLM provider abstraction."""

from langchain_google_genai import ChatGoogleGenerativeAI
from ..config import get_ai_settings


def get_llm(temperature: float | None = None, model: str | None = None):
    """
    Get configured LLM instance.

    Args:
        temperature: Override default temperature
        model: Override default model

    Returns:
        Configured ChatGoogleGenerativeAI instance
    """
    settings = get_ai_settings()

    return ChatGoogleGenerativeAI(
        model=model or settings.default_model,
        api_key=settings.gemini_api_key,
        temperature=temperature if temperature is not None else settings.default_temperature,
    )
