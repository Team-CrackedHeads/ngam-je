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

    **Note**: Chat history is NOT stored in the database.
    The frontend should maintain the conversation state.
    """
    try:
        logger.info(f"AI chat request from user {current_user.id}: {request.message[:50]}...")

        # Build conversation history for Pydantic AI
        message_history = []
        if request.conversation_history:
            logger.info(f"Received {len(request.conversation_history)} messages in conversation history")
            for i, msg in enumerate(request.conversation_history):
                if not msg.role or not msg.content:
                    logger.warning(f"Skipping invalid message at index {i}: role={msg.role}, content_len={len(msg.content) if msg.content else 0}")
                    continue

                message_history.append({
                    "role": msg.role,
                    "content": msg.content
                })

            logger.info(f"Processed {len(message_history)} valid messages from conversation history")
        else:
            logger.info("No conversation history provided")

        # Call the AI assistant with user context and conversation history
        response = await chat_with_assistant(
            message=request.message,
            db=db,
            user_id=current_user.id,
            conversation_history=message_history if message_history else None
        )

        logger.info(f"AI response generated: {len(response.content)} chars, {len(response.links)} links")

        # Normalize links: ensure 'text' field exists (AI sometimes uses 'label')
        normalized_links = []
        for link in response.links:
            normalized_link = {}
            # Handle 'url' field
            if 'url' in link:
                normalized_link['url'] = link['url']

            # Handle 'text' or 'label' field
            if 'text' in link:
                normalized_link['text'] = link['text']
            elif 'label' in link:
                normalized_link['text'] = link['label']  # Convert 'label' to 'text'

            # Only add link if it has both url and text
            if 'url' in normalized_link and 'text' in normalized_link:
                normalized_links.append(normalized_link)

        return ChatMessageResponse(
            content=response.content,
            links=normalized_links
        )

    except Exception as e:
        logger.error(f"Error in AI chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"AI chat service error: {str(e)}"
        )
