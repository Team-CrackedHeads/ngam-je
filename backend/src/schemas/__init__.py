"""Schema exports."""

from src.schemas.user import User, UserUpdate
from src.schemas.thread import ThreadCreate, ThreadUpdate, ThreadResponse
from src.schemas.listing import ListingCreate, ListingUpdate, ListingResponse
from src.schemas.faq import FAQQuestionCreate, FAQAnswerCreate, FAQUpdate
from src.schemas.faq_schema import FAQRequest, AIWidgetResponse, FAQResponse
from src.schemas.faq_reply import FAQReplyCreate, FAQReplyUpdate, FAQReplyResponse
from src.schemas.recommendation import (
    RecommendationCreate,
    RecommendationUpdate,
    RecommendationResponse,
)
from src.schemas.conversation import ConversationCreate, ConversationResponse
from src.schemas.message import MessageCreate, MessageResponse

__all__ = [
    # User schemas (Clerk-managed auth, no auth/token schemas needed)
    "User",
    "UserUpdate",
    # Thread schemas
    "ThreadCreate",
    "ThreadUpdate",
    "ThreadResponse",
    # Listing schemas
    "ListingCreate",
    "ListingUpdate",
    "ListingResponse",
    # FAQ schemas
    "FAQQuestionCreate",
    "FAQAnswerCreate",
    "FAQUpdate",
    "FAQRequest",
    "AIWidgetResponse",
    "FAQResponse",
    # FAQ Reply schemas
    "FAQReplyCreate",
    "FAQReplyUpdate",
    "FAQReplyResponse",
    # Recommendation schemas
    "RecommendationCreate",
    "RecommendationUpdate",
    "RecommendationResponse",
    # Conversation schemas
    "ConversationCreate",
    "ConversationResponse",
    # Message schemas
    "MessageCreate",
    "MessageResponse",
]
