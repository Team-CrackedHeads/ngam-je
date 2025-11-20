"""
Configuration for AI-to-AI negotiation
"""

from pydantic import BaseModel


class NegotiationConfig(BaseModel):
    """Configuration for negotiation limits"""

    MAX_TURNS: int = 3  # Max 3 back-and-forth (6 messages total)
    MAX_DURATION_SECONDS: int = 30  # 30 second timeout
    MAX_TOKENS_PER_TURN: int = 1000  # Increased to allow for File Search + response
    MAX_TOTAL_COST: float = 0.05  # 5 cents max per negotiation
    TOP_N_MATCHES: int = 5  # Only negotiate with top 5 matches


# Default config for prototype
DEFAULT_CONFIG = NegotiationConfig()
