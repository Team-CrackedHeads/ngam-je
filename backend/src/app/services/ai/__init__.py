"""
AI Services Module.

This module provides AI-powered services including agents, tools, and utilities
for building intelligent applications.

Modules:
    - agents: AI agents for various tasks (product search, customer service, etc.)
    - core: Core abstractions and base classes
    - mcp: Model Context Protocol servers
    - utils: Reusable utilities
    - config: Configuration management
"""

from .config import get_ai_settings
from .core import BaseAgent, BaseTool, get_llm

__all__ = [
    "get_ai_settings",
    "BaseAgent",
    "BaseTool",
    "get_llm",
]
