"""AI Chat endpoints"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database import get_db
from src.app.core.logging_config import get_logger
from src.schemas.ai_chat import ChatMessageRequest, ChatMessageResponse
from src.app.services.ai_chat import chat_with_assistant
from src.app.api.deps import get_current_user
from src.models.user import User

logger = get_logger("app.api.v1.endpoints.ai_chat")

router = APIRouter()


@router.post("/chat", response_model=ChatMessageResponse)
async def send_chat_message(
    request: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Send a message to the AI chat assistant.

    The assistant can help with:
    - Analyzing your own listings and marketplace activity
    - Searching for listings and threads across the marketplace
    - Getting personalized insights and recommendations
    - Finding FAQs about products
    - Providing links to relevant pages

    **Note**: Chat history is not stored in the database.
    The frontend should maintain the conversation state.
    """
    try:
        logger.info(f"AI chat request from user {current_user.id}: {request.message[:50]}...")

        # Build conversation history for Pydantic AI
        message_history = []
        if request.conversation_history:
            for msg in request.conversation_history:
                message_history.append({
                    "role": msg.role,
                    "content": msg.content
                })

        # Call the AI assistant with user context and conversation history
        response = await chat_with_assistant(
            message=request.message,
            db=db,
            user_id=current_user.id,
            conversation_history=message_history
        )

        return ChatMessageResponse(
            content=response.content,
            links=response.links
        )

    except Exception as e:
        logger.error(f"Error in AI chat: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"AI chat service error: {str(e)}"
        )
