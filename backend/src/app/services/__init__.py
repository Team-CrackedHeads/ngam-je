"""
Application Services.

Domain-based service organization following clean architecture principles.

Domains:
    - ai: AI services (agents, tools, MCP servers)
    - kyc: KYC verification services
    - users: User management (authentication handled by Clerk)

Usage:
    Import directly from domains for clarity and explicit dependencies:

    >>> from src.app.services.ai.agents import ProductSearchAgent
    >>> from src.app.services.kyc import didit_service

Each domain is self-contained with its own models, services, and utilities.
"""

# This file intentionally left minimal to encourage explicit domain imports
# Import from specific domains instead of this base module
