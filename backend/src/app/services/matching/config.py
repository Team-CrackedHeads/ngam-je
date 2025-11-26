"""
Configuration for AI-to-AI negotiation
"""

from pydantic import BaseModel


class NegotiationConfig(BaseModel):
    """Configuration for negotiation limits"""

    MAX_TURNS: int = 4  # Max 4 back-and-forth (8 messages total)
    MAX_DURATION_SECONDS: int = 45  # 45 second timeout for longer conversations
    MAX_TOKENS_PER_TURN: int = 1000  # Increased to allow for File Search + response
    MAX_TOTAL_COST: float = 0.05  # 5 cents max per negotiation
    TOP_N_MATCHES: int = 5  # Only negotiate with top 5 matches


# Default config for prototype
DEFAULT_CONFIG = NegotiationConfig()
