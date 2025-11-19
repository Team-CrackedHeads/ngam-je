"""
Ngam AI Chat Assistant - Pydantic AI-based intelligent marketplace assistant

Purpose: Help users browse and analyze the Ngam marketplace database
- Search for listings and threads
- Analyze pricing and marketplace data
- Access FAQ information
- Provide links to relevant threads, listings, and FAQs
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.google import GoogleModel
from pydantic_ai.providers.google import GoogleProvider
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_

from src.app.core.logging_config import get_logger
from src.app.services.ngam_overview.config import get_ngam_settings
from src.models.listing import Listing
from src.models.thread import Thread
from src.models.faq import FAQ

logger = get_logger("app.services.ai_chat.assistant")


# Output model for AI responses
class AssistantResponse(BaseModel):
    """Response from the AI assistant"""
    content: str = Field(description="The AI's response in markdown format")
    links: List[Dict[str, str]] = Field(
        default_factory=list,
        description="Relevant links (e.g., thread pages, listing details, FAQs)"
    )


# Dependencies for the agent
class ChatAssistantDeps(BaseModel):
    """Dependencies for chat assistant agent"""
    db: Any  # Session - avoiding circular imports
    user_id: Optional[int] = None  # User ID is an integer in the database

    class Config:
        arbitrary_types_allowed = True


# Lazy-initialized agent
_chat_assistant_agent: Optional[Agent] = None


CHAT_ASSISTANT_SYSTEM_PROMPT = """# CONTEXT
You are Ngam AI, an intelligent marketplace assistant for the Ngam secondhand marketplace platform. Users can buy/sell items, post threads, and ask FAQs. You have access to real-time database information about:
- User's personal listings (items they're selling or looking to buy)
- All marketplace listings across threads
- FAQ data for products
- Pricing and availability statistics

# OBJECTIVE
Your primary goal is to help users efficiently navigate and analyze the marketplace by:
1. Providing personalized insights about THEIR OWN listings and marketplace activity
2. Helping them find items TO BUY in the marketplace
3. Analyzing market pricing trends
4. Directing them to relevant pages with actionable links

# STYLE
- **Concise & Direct**: Get to the point quickly - no fluff
- **Summary-First**: Always provide overview/stats BEFORE detailed listings
- **Selective Details**: Show 1-2 examples, then ask if they want more
- **Conversational**: Natural language, not robotic

# TONE
- Helpful and friendly
- Data-driven and factual
- Proactive but not pushy

# AUDIENCE
Marketplace users who want quick insights about their items or want to find items to purchase. They value:
- Speed and efficiency
- Accurate data
- Actionable information with direct links

# RESPONSE FORMAT

## Tool Selection (CRITICAL - Read Carefully):

**Rule 0: No Tools for Casual Conversation**
- Simple greetings, small talk, or general questions → NO TOOLS NEEDED
- Examples that DON'T need tools:
  * "Hi", "Hello", "How are you", "What's up" → Just respond conversationally
  * "What can you do?", "Help me" → Explain your capabilities, no tools
  * "Thank you", "Thanks", "Great" → Acknowledge, no tools
- ONLY use tools when the user asks for specific data/actions

**Rule 1: Personal Listings** (Keywords: "my", "mine", "I", "me")
- Question about user's OWN items → ONLY use `get_my_listings`
- Examples:
  * "What are my listings?" → get_my_listings
  * "Analyze my prices" → get_my_listings (then analyze the price data from results)
  * "How am I doing?" → get_my_listings
  * "Analyze the price" (after asking about "my listings") → get_my_listings

**Rule 2: Marketplace Search** (Keywords: "find", "search", "looking for", "show me", "under", "around", "budget")
- Finding items TO BUY → use `search_marketplace`
- Budget queries → use `search_marketplace` and filter results by price
- Examples:
  * "Find shoes" → search_marketplace(query="shoes")
  * "Search for iPhone" → search_marketplace(query="iPhone")
  * "Items under RM500" → search_marketplace(query="") and mention budget in response
  * "Laptops around RM3000" → search_marketplace(query="laptop") and highlight items near that price

**Rule 3: Market Analysis** (General trends, not personal)
- Analyzing marketplace pricing → use `analyze_listings`
- Example: "What's the average iPhone price?" → analyze_listings(query="iPhone")

## Response Structure:
1. Start with summary/overview (stats, totals, key insights)
2. Show 1-2 specific examples with links
3. Ask if they want to see more or analyze specific items

## Context Awareness (CRITICAL - NEVER REPEAT YOURSELF):
**MOST IMPORTANT RULE**: If you already answered a question in this conversation, DO NOT call the same tool again with the same parameters!

- **You have access to conversation history** - READ IT before responding
- If the user already asked about their listings and you showed them, DON'T fetch them again
- For follow-up questions, use the data you ALREADY HAVE from previous tool calls

**Handling Yes/No and Short Responses:**
- If you asked a question and the user replies "yes", "no", "sure", "okay", etc., UNDERSTAND WHAT THEY'RE AGREEING TO
- Example:
  * You: "Would you like me to search for shoes across all listings?"
  * User: "Yes"
  * Action: Search for shoes using `search_marketplace` with query "shoes"
- If user says "yes" or "tell me more" or similar, look at YOUR PREVIOUS MESSAGE to understand what they want

**Handling Budget/Price Queries:**
- When user asks about items under/around a certain price (e.g., "items under RM500", "laptops around RM3000"):
  1. Search using `search_marketplace` with the item type (or empty query for all items)
  2. From the results, filter and highlight items within their budget
  3. Show price-sorted results with **bold prices**
- Example:
  * User: "Any laptops under RM3000?"
  * Action: search_marketplace(query="laptop") → Filter results ≤ RM3000 → Show cheapest first
  * Response: "I found **3** laptops under **RM3000**. Here are the options: [list with prices in bold]"

**Examples of what to do:**
1. User asks "What are my listings?" → Call `get_my_listings` → Show summary
2. User asks "Analyze my prices" → DON'T call `get_my_listings` again! Use the data from step 1 and calculate:
   - Price range (min to max)
   - Average price for sale items vs wanted items
   - Which items are priced highest/lowest
3. User asks "Tell me more" → DON'T call tools again! Show more listings from the data you already fetched
4. You ask "Would you like to search for X?" → User says "Yes" → DO THE SEARCH for X

**If you don't have the data yet, THEN call the tool. Otherwise, work with what you already have!**

## Formatting Rules (CRITICAL):
1. **Bold all important numbers** using **number** syntax (counts, prices, views, totals)
2. **Bold all key stats** in summaries
3. **Separate multiple links with pipes** like this: [View Listing](/path) | [View FAQ](/path)
4. Use natural, conversational language

**Good Example:**
"You have **17** active listings in total: **6** for selling and **11** for items you're looking to buy. Your listings have received a total of **154** views.

Here are a couple of your active listings:

Selling: Nintendo Switch Limited Edition - **RM800** [View Listing](/threads/2/listings/9) | [View FAQ](/threads/2/listings/9/faq) (**3 FAQs available**)

Looking for: MacBook Pro M3 14-inch - **RM6500** [View Listing](/threads/5/listings/12) (**2 FAQs available**)

Would you like to see all your listings or analyze specific items?"

**Bad Example:**
"Here are all your listings: [dumps 17 items without context and no bold formatting]"

## Available Links:
- Thread: `/threads/{id}`
- Listing: `/threads/{thread_id}/listings/{id}`
- FAQ: `/threads/{thread_id}/listings/{id}/faq`
- All Threads: `/threads`

When a listing has both listing and FAQ links, ALWAYS separate them with a pipe (|) like:
[View Listing](/threads/2/listings/9) | [View FAQ](/threads/2/listings/9/faq)

Always be helpful and direct users to relevant pages. When listings have FAQs, mention them!"""


def get_chat_assistant_agent() -> Agent:
    """Get or create chat assistant agent"""
    global _chat_assistant_agent
    if _chat_assistant_agent is None:
        settings = get_ngam_settings()
        provider = GoogleProvider(api_key=settings.gemini_api_key)
        model = GoogleModel(settings.model_name, provider=provider)

        _chat_assistant_agent = Agent(
            model,
            deps_type=ChatAssistantDeps,
            output_type=AssistantResponse,
            system_prompt=CHAT_ASSISTANT_SYSTEM_PROMPT,
        )

        # Register tools
        register_tools(_chat_assistant_agent)

    return _chat_assistant_agent


def register_tools(agent: Agent) -> None:
    """Register all tools for the AI assistant"""

    @agent.tool
    async def search_marketplace(
        ctx: RunContext[ChatAssistantDeps],
        query: str,
        search_type: str = "all",  # "listings", "threads", "all"
        limit: int = 10
    ) -> Dict[str, Any]:
        """
        Search the marketplace for listings and threads.

        Args:
            query: Search term (e.g., "air jordan", "board games", "vintage watch")
            search_type: What to search - "listings", "threads", or "all"
            limit: Maximum results per category

        Returns:
            Dictionary with search results including FAQ availability
        """
        db: Session = ctx.deps.db
        results = {"query": query, "listings": [], "threads": []}

        # Search listings
        if search_type in ["listings", "all"]:
            search_filter = or_(
                Listing.title.ilike(f"%{query}%"),
                Listing.description.ilike(f"%{query}%")
            )
            listings = db.query(Listing).filter(
                and_(Listing.is_active == True, search_filter)
            ).limit(limit).all()

            for listing in listings:
                # Check if this listing has FAQs
                faq_count = db.query(func.count(FAQ.id)).filter(
                    FAQ.listing_id == listing.id
                ).scalar()

                listing_data = {
                    "id": listing.id,
                    "title": listing.title,
                    "price": float(listing.price),
                    "listing_type": listing.listing_type,
                    "thread_id": listing.thread_id,
                    "faq_count": faq_count,
                    "links": {}
                }

                # Add links
                if listing.thread_id:
                    listing_data["links"]["listing"] = f"/threads/{listing.thread_id}/listings/{listing.id}"
                    if faq_count > 0:
                        listing_data["links"]["faq"] = f"/threads/{listing.thread_id}/listings/{listing.id}/faq"

                results["listings"].append(listing_data)

        # Search threads
        if search_type in ["threads", "all"]:
            search_filter = or_(
                Thread.title.ilike(f"%{query}%"),
                Thread.description.ilike(f"%{query}%")
            )
            threads = db.query(Thread).filter(search_filter).limit(limit).all()

            for thread in threads:
                # Count listings in this thread
                listing_count = db.query(func.count(Listing.id)).filter(
                    Listing.thread_id == thread.id
                ).scalar()

                results["threads"].append({
                    "id": thread.id,
                    "title": thread.title,
                    "description_preview": thread.description[:150] + "..." if len(thread.description) > 150 else thread.description,
                    "listing_count": listing_count,
                    "link": f"/threads/{thread.id}"
                })

        results["total_found"] = len(results["listings"]) + len(results["threads"])
        return results

    @agent.tool
    async def get_faqs(
        ctx: RunContext[ChatAssistantDeps],
        listing_id: Optional[str] = None,
        query: Optional[str] = None,
        limit: int = 5
    ) -> Dict[str, Any]:
        """
        Get FAQ/questions from the marketplace.

        Args:
            listing_id: Optional - get FAQs for specific listing
            query: Optional - search FAQs by keyword
            limit: Maximum number of FAQs to return

        Returns:
            Dictionary with FAQ data and links
        """
        db: Session = ctx.deps.db

        filters = []

        if listing_id:
            filters.append(FAQ.listing_id == listing_id)

        if query:
            search_filter = or_(
                FAQ.question.ilike(f"%{query}%"),
                FAQ.answer.ilike(f"%{query}%")
            )
            filters.append(search_filter)

        # Get FAQs
        query_obj = db.query(FAQ)
        if filters:
            query_obj = query_obj.filter(and_(*filters))

        faqs_result = query_obj.limit(limit).all()

        faqs = []
        for q in faqs_result:
            # Get the listing's thread_id for FAQ link
            listing = db.query(Listing).filter(Listing.id == q.listing_id).first()

            faq_data = {
                "id": q.id,
                "question": q.question,
                "answer": q.answer,
                "listing_id": q.listing_id,
                "asker_name": q.question_username,
                "created_at": q.created_at.isoformat() if q.created_at else None
            }

            # Add FAQ page link if we have thread_id
            if listing and listing.thread_id:
                faq_data["faq_link"] = f"/threads/{listing.thread_id}/listings/{q.listing_id}/faq"

            faqs.append(faq_data)

        return {
            "count": len(faqs),
            "faqs": faqs,
            "filters": {
                "listing_id": listing_id,
                "query": query
            }
        }

    @agent.tool
    async def analyze_listings(
        ctx: RunContext[ChatAssistantDeps],
        query: str
    ) -> Dict[str, Any]:
        """
        Analyze listings for pricing and availability.

        Args:
            query: Item to analyze (e.g., "gaming pc", "air jordan")

        Returns:
            Dictionary with analysis data
        """
        db: Session = ctx.deps.db

        search_filter = or_(
            Listing.title.ilike(f"%{query}%"),
            Listing.description.ilike(f"%{query}%")
        )

        # Get active listings
        listings = db.query(Listing).filter(
            and_(Listing.is_active == True, search_filter)
        ).all()

        if not listings:
            return {
                "found": False,
                "query": query,
                "message": f"No active listings found for '{query}'",
                "suggestion": "Try browsing all threads at /threads"
            }

        # Calculate statistics
        prices = [float(l.price) for l in listings]
        listing_types = {}

        for listing in listings:
            # Count by type
            listing_type = listing.listing_type
            listing_types[listing_type] = listing_types.get(listing_type, 0) + 1

        # Get sample listings with FAQ info
        sample_listings = []
        for l in listings[:3]:  # Top 3
            faq_count = db.query(func.count(FAQ.id)).filter(
                FAQ.listing_id == l.id
            ).scalar()

            listing_data = {
                "title": l.title,
                "price": float(l.price),
                "listing_type": l.listing_type,
                "faq_count": faq_count,
                "links": {}
            }

            if l.thread_id:
                listing_data["links"]["listing"] = f"/threads/{l.thread_id}/listings/{l.id}"
                if faq_count > 0:
                    listing_data["links"]["faq"] = f"/threads/{l.thread_id}/listings/{l.id}/faq"

            sample_listings.append(listing_data)

        return {
            "found": True,
            "query": query,
            "total_listings": len(listings),
            "price_range": {
                "min": min(prices),
                "max": max(prices),
                "avg": sum(prices) / len(prices)
            },
            "by_type": listing_types,
            "sample_listings": sample_listings
        }

    @agent.tool
    async def get_my_listings(
        ctx: RunContext[ChatAssistantDeps],
        status: str = "all"  # "active", "inactive", "all"
    ) -> Dict[str, Any]:
        """
        Get the current user's listings with statistics.

        Args:
            status: Filter by status - "active", "inactive", or "all"

        Returns:
            Dictionary with user's listings and stats
        """
        db: Session = ctx.deps.db
        user_id = ctx.deps.user_id

        if not user_id:
            return {
                "error": "User not logged in",
                "message": "Please log in to view your listings"
            }

        # Build query
        query = db.query(Listing).filter(Listing.user_id == user_id)

        if status == "active":
            query = query.filter(Listing.is_active == True)
        elif status == "inactive":
            query = query.filter(Listing.is_active == False)

        listings = query.all()

        if not listings:
            return {
                "found": False,
                "message": "You don't have any listings yet",
                "suggestion": "Create your first listing to start trading!"
            }

        # Calculate stats
        total_listings = len(listings)
        active_count = sum(1 for l in listings if l.is_active)
        inactive_count = total_listings - active_count

        selling = [l for l in listings if l.listing_type == "sale"]
        buying = [l for l in listings if l.listing_type == "wanted"]

        # Get detailed listing info
        listing_details = []
        for l in listings:
            faq_count = db.query(func.count(FAQ.id)).filter(
                FAQ.listing_id == l.id
            ).scalar()

            detail = {
                "id": l.id,
                "title": l.title,
                "price": float(l.price),
                "listing_type": l.listing_type,
                "is_active": l.is_active,
                "views": l.views,
                "faq_count": faq_count,
                "created_at": l.created_at.isoformat() if l.created_at else None,
                "links": {}
            }

            if l.thread_id:
                detail["links"]["listing"] = f"/threads/{l.thread_id}/listings/{l.id}"
                if faq_count > 0:
                    detail["links"]["faq"] = f"/threads/{l.thread_id}/listings/{l.id}/faq"

            listing_details.append(detail)

        return {
            "found": True,
            "total_listings": total_listings,
            "active": active_count,
            "inactive": inactive_count,
            "selling_count": len(selling),
            "buying_count": len(buying),
            "listings": listing_details[:10],  # Top 10
            "total_views": sum(l.views for l in listings)
        }


async def chat_with_assistant(
    message: str,
    db: Session,
    user_id: Optional[int] = None,
    conversation_history: Optional[List[Dict[str, str]]] = None
) -> AssistantResponse:
    """
    Chat with the AI assistant.

    Args:
        message: User's message
        db: Database session
        user_id: Optional user ID
        conversation_history: Optional list of previous messages for context

    Returns:
        AssistantResponse with content and links
    """
    agent = get_chat_assistant_agent()
    deps = ChatAssistantDeps(db=db, user_id=user_id)

    try:
        logger.info(f"Chat query: {message}")

        # Log conversation history for debugging
        if conversation_history:
            logger.info(f"Conversation history length: {len(conversation_history)}")
            logger.info(f"Last message in history: {conversation_history[-1] if conversation_history else 'None'}")
            result = await agent.run(message, message_history=conversation_history, deps=deps)
        else:
            logger.info("No conversation history provided")
            result = await agent.run(message, deps=deps)

        logger.info(f"Chat response generated successfully")
        return result.output
    except Exception as e:
        logger.error(f"Error in chat assistant: {str(e)}", exc_info=True)
        # Return a fallback response
        return AssistantResponse(
            content=f"I encountered an error processing your request. Please try rephrasing your question or visit [all threads](/threads) to browse manually.",
            links=[{"text": "Browse All Threads", "url": "/threads"}]
        )
