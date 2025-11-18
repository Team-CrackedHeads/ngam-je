"""
AI FAQ Moderator Module
This module provides RAG-based FAQ answering capabilities for e-commerce listings.
"""

from . import agent
from .tools import (
    rag_query,
    retrieve_similar_faqs,
    generate_grounded_response,
    get_query_embedding,
    cosine_similarity
)

__all__ = [
    "agent",
    "rag_query",
    "retrieve_similar_faqs",
    "generate_grounded_response",
    "get_query_embedding",
    "cosine_similarity"
]