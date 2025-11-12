"""Schema exports."""

from src.schemas.user import User, UserUpdate
from src.schemas.thread import (
    ThreadCreate,
    ThreadUpdate,
    ThreadResponse,
    ThreadListResponse,
)
from src.schemas.listing import (
    FAQItem,
    ListingCreate,
    ListingUpdate,
    ListingResponse,
    ListingListResponse,
)
from src.schemas.conversation import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    ConversationListResponse,
)
from src.schemas.message import (
    MessageCreate,
    MessageUpdate,
    MessageResponse,
    MessageListResponse,
)

__all__ = [
    # User schemas (Clerk-managed auth, no auth/token schemas needed)
    "User",
    "UserUpdate",
    # Thread schemas
    "ThreadCreate",
    "ThreadUpdate",
    "ThreadResponse",
    "ThreadListResponse",
    # Listing schemas
    "FAQItem",
    "ListingCreate",
    "ListingUpdate",
    "ListingResponse",
    "ListingListResponse",
    # Conversation schemas
    "ConversationCreate",
    "ConversationUpdate",
    "ConversationResponse",
    "ConversationListResponse",
    # Message schemas
    "MessageCreate",
    "MessageUpdate",
    "MessageResponse",
    "MessageListResponse",
]
