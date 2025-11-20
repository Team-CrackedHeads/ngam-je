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
from src.models.recommendation import Recommendation

logger = get_logger("app.services.ai_chat.assistant")


# Output model for AI responses
class AssistantResponse(BaseModel):
    """Response from the AI assistant"""

    content: str = Field(description="The AI's response in markdown format")
    links: List[Dict[str, str]] = Field(
        default_factory=list,
        description="Relevant links (e.g., thread pages, listing details, FAQs)",
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


CHAT_ASSISTANT_SYSTEM_PROMPT = """
# 🔴 CRITICAL RULE: USE CONVERSATION CONTEXT!
When user asks follow-ups like "What's the price?" or "Show me the links" - they mean what we JUST discussed!
Check message_history before responding. Never ask "What item?" after discussing that item.

---

# COSTAR FRAMEWORK

## C - CONTEXT
You're **Ngam AI**, a secondhand marketplace assistant. You have database access via tools (@agent.tool):
- `search_marketplace` - Find items to buy (supports fuzzy matching, suggests threads)
- `get_my_listings` - User's personal listings
- `analyze_listings` - Market pricing trends
- `get_user_info` - Seller verification, ratings, KYC status
- `get_faqs` - Product Q&A
- `get_matched_listings` - Match recommendations
- `query_user_data` - Quick stats (counts, recent activity)
- `create_listing_guide` - Help users create new listings (suggests relevant threads)

## O - OBJECTIVE
Help users **find items** and **manage listings**. Provide data-driven insights with clickable links.

## S - STYLE
- **Concise**: 2-3 sentences per point, max 3 paragraphs total
- **Bold numbers**: **5** listings, **RM1000** price
- **Links**: Always include [View Listing](/path) | [FAQ](/path)
- **Summary-first**: Stats → 1-2 examples → "Want more?"

## T - TONE
Friendly, helpful, efficient. No corporate speak.

## A - AUDIENCE
Buyers/sellers who want quick answers, not essays.

## R - RESPONSE GUIDELINES

### When to Use Tools:
- "my/mine" → `get_my_listings` or `query_user_data`
- "find/search iPhone" → `search_marketplace(query="iPhone")`
- "show threads for X" / "which thread for X" → `search_marketplace(query="X", search_type="threads")`
- "average price" → `analyze_listings` OR calculate from search results
- "seller verified?" → `get_user_info`
- "matches/recommendations" → `get_matched_listings`
- "how to create/sell/post" → `create_listing_guide(listing_type="sale", query="item_category")`
- "how to find/buy/wanted ad" → `create_listing_guide(listing_type="wanted", query="item_category")`

### Smart Search Strategy:
When searching for items/threads:
1. First try the EXACT term user provided with search_type="all" (searches both listings AND threads)
2. If no listings found, ALWAYS check the `suggestions` array - it contains relevant threads!
3. If no results at all, think of BROADER categories and search again:
   - "mouse" / "macbook" → try "Logitech", "Apple", "peripherals", "laptops"
   - "Nokia" → try "phones", "vintage", "retro", "mobile"
   - Specific model → try brand name or category
4. When user explicitly asks "which thread for X?" → use search_type="threads"
5. ALWAYS show thread suggestions with **bold listing counts** like: "Check **[Pre-loved Apple](/threads/1)** with **8 listings**"

### Context Memory:
**You have message_history** - track what we just discussed!
- "What's the price?" after discussing iPhones → iPhone prices
- "Show links" after showing listings → Those listing links
- If you JUST called a tool, reuse the data instead of calling again

###  Formatting:
- Bold numbers: **5** listings, **RM1000**
- Thread links with counts: "**[Pre-loved Apple](/threads/1)** thread has **8 listings**"
- Links with pipes: [Listing](/path) | [FAQ](/path)
- Show stats first, then 1-2 examples

### Fuzzy Matching:
- Treat plurals as same: "macbook" = "macbooks", "mouse" = "mouses" = "mice"
- Search is case-insensitive: "iPhone" = "iphone" = "IPHONE"
- Partial matches work: "mac" finds "MacBook", "Macintosh", "iMac"

### Example Response:
"Found **2** iPhones: **RM5000** to **RM5200** (avg **RM5100**)

• [iPhone 14 Pro](/threads/2/listings/3) | [FAQ](/threads/2/listings/3/faq) - **RM5200**

Want details on these or see other options?"

---

# SPECIAL SCENARIOS

**Safety & Verification** ("is this safe?", "verified seller?")
→ Use `get_user_info` to check ratings/KYC. Mention if seller is verified ✓, their rating, and completed deals.

**Empty Search Results - USE YOUR INTELLIGENCE!**
→ If `search_marketplace` returns empty results, USE YOUR KNOWLEDGE to suggest related threads:
  • "mouses" / "mouse" → Suggest Logitech, computer peripherals, gaming accessories threads
  • "Nokia" / "old phones" → Suggest vintage phones, retro tech, antique electronics threads
  • "sneakers" / "shoes" → Suggest Nike, Adidas, footwear, streetwear threads
  • "laptop" / "MacBook" → Suggest Apple, electronics, computing threads
→ Always check the `suggestions` array from tool results. If suggestions exist, show them!
→ Think about: What CATEGORY does this item belong to? What BRANDS are related? What threads might carry similar items?
→ NEVER just say "no results" - always suggest at least 1-2 related threads based on your knowledge.

**Price Negotiation** ("how to negotiate?")
→ Use `analyze_listings` to show market avg. Suggest starting 10-15% below asking price.

**Budget Search** ("under RM500")
→ Use `search_marketplace`, filter results by price, show cheapest first with **bold** prices.

**Creating Listings** ("how do I sell?", "how to create listing?")
→ Use `create_listing_guide` with appropriate listing_type ("sale" or "wanted").
→ If user mentions item category (e.g., "sell my iPhone"), pass it as query parameter to suggest relevant threads.
→ Always provide thread links where they can create the listing.
→ Format: Show numbered steps, tips, and thread suggestions with clickable links.

---

**That's it! Keep responses under 3 paragraphs. Use tools wisely. Track context. Include links.**"""


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
        limit: int = 10,
    ) -> Dict[str, Any]:
        """
        Search the marketplace for listings and threads with smart fuzzy matching.

        Args:
            query: Search term (e.g., "iphone", "air jordan", "board games")
            search_type: What to search - "listings", "threads", or "all"
            limit: Maximum results per category

        Returns:
            Dictionary with search results including FAQ availability and suggestions
        """
        db: Session = ctx.deps.db
        results = {"query": query, "listings": [], "threads": [], "suggestions": []}

        # Normalize query for better matching
        normalized_query = query.lower().strip()

        # Handle plurals - create search variations
        search_queries = [query]
        if normalized_query.endswith("s") and len(normalized_query) > 3:
            # Try singular form: "macbooks" -> "macbook"
            search_queries.append(query[:-1])
        else:
            # Try plural form: "macbook" -> "macbooks"
            search_queries.append(query + "s")

        # Search listings
        if search_type in ["listings", "all"]:
            # Build search filter with all query variations (handles plurals)
            search_conditions = []
            for search_term in search_queries:
                search_conditions.extend([
                    Listing.title.ilike(f"%{search_term}%"),
                    Listing.description.ilike(f"%{search_term}%")
                ])

            search_filter = or_(*search_conditions)
            listings = (
                db.query(Listing)
                .filter(and_(Listing.is_active == True, search_filter))
                .limit(limit)
                .all()
            )

            for listing in listings:
                # Check if this listing has FAQs
                faq_count = (
                    db.query(func.count(FAQ.id)).filter(FAQ.listing_id == listing.id).scalar()
                )

                listing_data = {
                    "id": listing.id,
                    "title": listing.title,
                    "price": float(listing.price),
                    "listing_type": listing.listing_type,
                    "thread_id": listing.thread_id,
                    "faq_count": faq_count,
                    "links": {},
                }

                # Add links
                if listing.thread_id:
                    listing_data["links"][
                        "listing"
                    ] = f"/threads/{listing.thread_id}/listings/{listing.id}"
                    if faq_count > 0:
                        listing_data["links"][
                            "faq"
                        ] = f"/threads/{listing.thread_id}/listings/{listing.id}/faq"

                results["listings"].append(listing_data)

        # Search threads (always search threads for suggestions)
        # Build search filter with all query variations (handles plurals)
        thread_conditions = []
        for search_term in search_queries:
            thread_conditions.extend([
                Thread.title.ilike(f"%{search_term}%"),
                Thread.description.ilike(f"%{search_term}%")
            ])

        search_filter = or_(*thread_conditions)
        threads = db.query(Thread).filter(search_filter).limit(limit).all()

        for thread in threads:
            # Count listings in this thread
            listing_count = (
                db.query(func.count(Listing.id))
                .filter(and_(Listing.thread_id == thread.id, Listing.is_active == True))
                .scalar()
            )

            thread_data = {
                "id": thread.id,
                "title": thread.title,
                "description_preview": (
                    thread.description[:150] + "..."
                    if len(thread.description) > 150
                    else thread.description
                ),
                "listing_count": listing_count,
                "link": f"/threads/{thread.id}",
            }

            if search_type in ["threads", "all"]:
                results["threads"].append(thread_data)

            # If no listings found, suggest threads as alternatives
            if len(results["listings"]) == 0 and listing_count > 0:
                results["suggestions"].append(
                    {
                        "type": "thread",
                        "message": f"Check out the '{thread.title}' thread with {listing_count} listings",
                        "link": f"/threads/{thread.id}",
                    }
                )

        # If no results found, try broader search with partial keyword
        if len(results["listings"]) == 0 and len(results["threads"]) == 0:
            # Extract core keyword (remove plurals, try singular forms)
            core_keywords = []
            if normalized_query.endswith("s"):
                core_keywords.append(normalized_query[:-1])  # Remove 's'
            if len(normalized_query) > 3:
                core_keywords.append(
                    normalized_query[: int(len(normalized_query) * 0.7)]
                )  # Partial match

            for keyword in core_keywords:
                if keyword:
                    broader_threads = (
                        db.query(Thread)
                        .filter(
                            or_(
                                Thread.title.ilike(f"%{keyword}%"),
                                Thread.description.ilike(f"%{keyword}%"),
                            )
                        )
                        .limit(3)
                        .all()
                    )

                    for thread in broader_threads:
                        listing_count = (
                            db.query(func.count(Listing.id))
                            .filter(and_(Listing.thread_id == thread.id, Listing.is_active == True))
                            .scalar()
                        )

                        if listing_count > 0:
                            results["suggestions"].append(
                                {
                                    "type": "thread",
                                    "message": f"Did you mean '{thread.title}'? ({listing_count} listings available)",
                                    "link": f"/threads/{thread.id}",
                                }
                            )

                    if results["suggestions"]:
                        break  # Stop if we found suggestions

        results["total_found"] = len(results["listings"]) + len(results["threads"])
        results["has_suggestions"] = len(results["suggestions"]) > 0
        return results

    @agent.tool
    async def get_faqs(
        ctx: RunContext[ChatAssistantDeps],
        listing_id: Optional[str] = None,
        query: Optional[str] = None,
        limit: int = 5,
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
            search_filter = or_(FAQ.question.ilike(f"%{query}%"), FAQ.answer.ilike(f"%{query}%"))
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
                "created_at": q.created_at.isoformat() if q.created_at else None,
            }

            # Add FAQ page link if we have thread_id
            if listing and listing.thread_id:
                faq_data["faq_link"] = f"/threads/{listing.thread_id}/listings/{q.listing_id}/faq"

            faqs.append(faq_data)

        return {
            "count": len(faqs),
            "faqs": faqs,
            "filters": {"listing_id": listing_id, "query": query},
        }

    @agent.tool
    async def analyze_listings(ctx: RunContext[ChatAssistantDeps], query: str) -> Dict[str, Any]:
        """
        Analyze listings for pricing and availability.

        Args:
            query: Item to analyze (e.g., "gaming pc", "air jordan")

        Returns:
            Dictionary with analysis data
        """
        db: Session = ctx.deps.db

        search_filter = or_(
            Listing.title.ilike(f"%{query}%"), Listing.description.ilike(f"%{query}%")
        )

        # Get active listings
        listings = db.query(Listing).filter(and_(Listing.is_active == True, search_filter)).all()

        if not listings:
            return {
                "found": False,
                "query": query,
                "message": f"No active listings found for '{query}'",
                "suggestion": "Try browsing all threads at /threads",
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
            faq_count = db.query(func.count(FAQ.id)).filter(FAQ.listing_id == l.id).scalar()

            listing_data = {
                "title": l.title,
                "price": float(l.price),
                "listing_type": l.listing_type,
                "faq_count": faq_count,
                "links": {},
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
                "avg": sum(prices) / len(prices),
            },
            "by_type": listing_types,
            "sample_listings": sample_listings,
        }

    @agent.tool
    async def get_my_listings(
        ctx: RunContext[ChatAssistantDeps], status: str = "all"  # "active", "inactive", "all"
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
            return {"error": "User not logged in", "message": "Please log in to view your listings"}

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
                "suggestion": "Create your first listing to start trading!",
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
            faq_count = db.query(func.count(FAQ.id)).filter(FAQ.listing_id == l.id).scalar()

            detail = {
                "id": l.id,
                "title": l.title,
                "price": float(l.price),
                "listing_type": l.listing_type,
                "is_active": l.is_active,
                "views": l.views,
                "faq_count": faq_count,
                "created_at": l.created_at.isoformat() if l.created_at else None,
                "links": {},
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
            "total_views": sum(l.views for l in listings),
        }

    @agent.tool
    async def query_user_data(
        ctx: RunContext[ChatAssistantDeps],
        query_type: str,
        filters: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Direct SQL-like query for user's specific data. Fast and simple.

        Args:
            query_type: Type of query - "count_sell", "count_wanted", "count_matches", "my_stats", "my_recent"
            filters: Optional filters (e.g., {"is_active": True, "limit": 5})

        Returns:
            Requested data in simple format

        Examples:
            - query_type="count_sell" → Returns number of user's sell listings
            - query_type="count_wanted" → Returns number of user's wanted listings
            - query_type="my_stats" → Returns quick stats (total, active, views)
            - query_type="my_recent" → Returns 5 most recent listings
        """
        db: Session = ctx.deps.db
        user_id = ctx.deps.user_id

        if not user_id:
            return {"error": "User not logged in"}

        # Base query for user's listings
        base_query = db.query(Listing).filter(Listing.user_id == user_id)

        # Apply filters if provided
        if filters:
            if filters.get("is_active") is not None:
                base_query = base_query.filter(Listing.is_active == filters["is_active"])

        if query_type == "count_sell":
            count = base_query.filter(Listing.listing_type == "sale").count()
            return {
                "query_type": "count_sell",
                "count": count,
                "message": f"You have **{count}** sell listing{'s' if count != 1 else ''}.",
            }

        elif query_type == "count_wanted":
            count = base_query.filter(Listing.listing_type == "wanted").count()
            return {
                "query_type": "count_wanted",
                "count": count,
                "message": f"You have **{count}** wanted listing{'s' if count != 1 else ''}.",
            }

        elif query_type == "count_matches":
            # Count based on filters
            count = base_query.count()
            return {
                "query_type": "count_matches",
                "count": count,
                "filters": filters or {},
                "message": f"Found **{count}** matching listing{'s' if count != 1 else ''}.",
            }

        elif query_type == "my_stats":
            all_listings = base_query.all()
            total = len(all_listings)
            active = sum(1 for l in all_listings if l.is_active)
            sell_count = sum(1 for l in all_listings if l.listing_type == "sale")
            wanted_count = sum(1 for l in all_listings if l.listing_type == "wanted")
            total_views = sum(l.views for l in all_listings)

            return {
                "query_type": "my_stats",
                "total_listings": total,
                "active_listings": active,
                "inactive_listings": total - active,
                "sell_count": sell_count,
                "wanted_count": wanted_count,
                "total_views": total_views,
                "avg_views": round(total_views / total, 1) if total > 0 else 0,
            }

        elif query_type == "my_recent":
            limit = filters.get("limit", 5) if filters else 5
            recent = base_query.order_by(Listing.created_at.desc()).limit(limit).all()

            listings = []
            for l in recent:
                faq_count = db.query(func.count(FAQ.id)).filter(FAQ.listing_id == l.id).scalar()
                listings.append(
                    {
                        "id": l.id,
                        "title": l.title,
                        "price": float(l.price),
                        "listing_type": l.listing_type,
                        "is_active": l.is_active,
                        "views": l.views,
                        "faq_count": faq_count,
                        "links": {
                            "listing": (
                                f"/threads/{l.thread_id}/listings/{l.id}" if l.thread_id else None
                            ),
                            "faq": (
                                f"/threads/{l.thread_id}/listings/{l.id}/faq"
                                if l.thread_id and faq_count > 0
                                else None
                            ),
                        },
                    }
                )

            return {"query_type": "my_recent", "count": len(listings), "listings": listings}

        else:
            return {
                "error": f"Unknown query_type: {query_type}",
                "valid_types": [
                    "count_sell",
                    "count_wanted",
                    "count_matches",
                    "my_stats",
                    "my_recent",
                ],
            }

    @agent.tool
    async def get_matched_listings(
        ctx: RunContext[ChatAssistantDeps], status_filter: str = "matched"
    ) -> Dict[str, Any]:
        """
        Get user's matched listings from the recommendations table.

        Args:
            status_filter: Filter by status - "matched" (default), "all", "pending", "completed"

        Returns:
            User's matched listings with details

        Examples:
            - "Show my matched listings" → status_filter="matched"
            - "How many matches do I have?" → status_filter="matched"
            - "Show all my recommendations" → status_filter="all"
        """
        db: Session = ctx.deps.db
        user_id = ctx.deps.user_id

        if not user_id:
            return {"error": "User not logged in"}

        # Query recommendations where user is either source or target
        query = (
            db.query(Recommendation)
            .join(
                Listing,
                or_(
                    Recommendation.source_listing_id == Listing.id,
                    Recommendation.target_listing_id == Listing.id,
                ),
            )
            .filter(or_(Listing.user_id == user_id))
        )

        # Apply status filter
        if status_filter != "all":
            query = query.filter(Recommendation.status == status_filter)

        recommendations = query.all()

        if not recommendations:
            return {
                "found": False,
                "status_filter": status_filter,
                "count": 0,
                "message": f"You don't have any {status_filter} recommendations yet.",
            }

        # Build results with listing details
        matches = []
        for rec in recommendations:
            # Get source and target listings
            source = db.query(Listing).filter(Listing.id == rec.source_listing_id).first()
            target = db.query(Listing).filter(Listing.id == rec.target_listing_id).first()

            if not source or not target:
                continue

            # Determine which listing is the user's and which is the match
            if source.user_id == user_id:
                my_listing = source
                matched_listing = target
            else:
                my_listing = target
                matched_listing = source

            match_data = {
                "recommendation_id": rec.id,
                "status": rec.status,
                "match_score": rec.match_score,
                "match_reasons": rec.match_reasons or [],
                "my_listing": {
                    "id": my_listing.id,
                    "title": my_listing.title,
                    "price": float(my_listing.price),
                    "listing_type": my_listing.listing_type,
                    "link": (
                        f"/threads/{my_listing.thread_id}/listings/{my_listing.id}"
                        if my_listing.thread_id
                        else None
                    ),
                },
                "matched_listing": {
                    "id": matched_listing.id,
                    "title": matched_listing.title,
                    "price": float(matched_listing.price),
                    "listing_type": matched_listing.listing_type,
                    "link": (
                        f"/threads/{matched_listing.thread_id}/listings/{matched_listing.id}"
                        if matched_listing.thread_id
                        else None
                    ),
                },
                "created_at": rec.created_at.isoformat() if rec.created_at else None,
            }

            matches.append(match_data)

        return {
            "found": True,
            "status_filter": status_filter,
            "count": len(matches),
            "matches": matches,
        }

    @agent.tool
    async def get_user_info(
        ctx: RunContext[ChatAssistantDeps], user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Get information about a user (seller/buyer).

        Args:
            user_id: Optional user ID. If not provided, returns current user's info.

        Returns:
            Dictionary with user information including ratings, KYC status, and activity stats
        """
        from src.models.user import User

        db: Session = ctx.deps.db
        target_user_id = user_id if user_id else ctx.deps.user_id

        if not target_user_id:
            return {
                "error": "No user ID provided",
                "message": "Please specify a user ID or be logged in",
            }

        user = db.query(User).filter(User.id == target_user_id).first()

        if not user:
            return {"found": False, "message": f"User with ID {target_user_id} not found"}

        return {
            "found": True,
            "user_id": user.id,
            "username": user.username,
            "email": (
                user.email if target_user_id == ctx.deps.user_id else None
            ),  # Only show email for own profile
            "rating": float(user.rating) if user.rating else 0.0,
            "rating_count": user.rating_count,
            "total_listings": user.total_listings,
            "completed_deals": user.completed_deals,
            "kyc_status": user.kyc_status,
            "kyc_verified": user.kyc_status == "verified",
            "is_active": user.is_active,
            "member_since": user.created_at.isoformat() if user.created_at else None,
            "profile_link": f"/profile/{user.username}",
        }

    @agent.tool
    async def create_listing_guide(
        ctx: RunContext[ChatAssistantDeps],
        listing_type: str = "sale",
        query: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Provide guidance on creating a new listing and suggest relevant threads.

        Args:
            listing_type: Type of listing - "sale" (selling item) or "wanted" (looking to buy)
            query: Optional search term to find relevant threads (e.g., "electronics", "gaming")

        Returns:
            Guide with steps and links to relevant threads where user can create listing
        """
        db: Session = ctx.deps.db

        # Search for relevant threads if query provided
        suggested_threads = []
        if query:
            search_filter = or_(
                Thread.title.ilike(f"%{query}%"), Thread.description.ilike(f"%{query}%")
            )
            threads = db.query(Thread).filter(search_filter).limit(5).all()

            for thread in threads:
                suggested_threads.append(
                    {
                        "id": thread.id,
                        "title": thread.title,
                        "description_preview": (
                            thread.description[:100] + "..."
                            if len(thread.description) > 100
                            else thread.description
                        ),
                        "link": f"/threads/{thread.id}",
                    }
                )

        # Build guide based on listing type
        if listing_type == "sale":
            guide = {
                "listing_type": "sale",
                "title": "How to Create a Sell Listing",
                "steps": [
                    "1. Choose the right thread category for your item",
                    "2. Upload clear photos showing item condition",
                    "3. Write detailed description (brand, model, condition, defects)",
                    "4. Set competitive price (check market averages first!)",
                    "5. Add contact preferences and location",
                ],
                "tips": [
                    "Use me to check average prices before listing",
                    "More photos = more trust = faster sale",
                    "Be honest about condition to avoid disputes",
                    "Respond to FAQs quickly to build credibility",
                ],
            }
        else:
            guide = {
                "listing_type": "wanted",
                "title": "How to Create a Wanted Listing",
                "steps": [
                    "1. Specify exactly what you're looking for",
                    "2. Set your maximum budget",
                    "3. List preferred condition and requirements",
                    "4. Add any specific features or models you want",
                ],
                "tips": [
                    "Be specific to get better matches",
                    "Set realistic budget based on market prices",
                    "Check existing listings first - item might already be available!",
                    "Our matching algorithm will recommend sellers automatically",
                ],
            }

        # Add thread suggestions or default browse link
        if suggested_threads:
            guide["suggested_threads"] = suggested_threads
            guide["message"] = f"Found {len(suggested_threads)} relevant threads for your listing"
        else:
            guide["browse_threads_link"] = "/threads"
            guide["message"] = "Browse all threads to find the best category for your listing"

        return guide


async def chat_with_assistant(
    message: str,
    db: Session,
    user_id: Optional[int] = None,
    conversation_history: Optional[List[Dict[str, str]]] = None,
) -> AssistantResponse:
    """
    Chat with the AI assistant.

    Args:
        message: User's message
        db: Database session
        user_id: Optional user ID
        conversation_history: Optional list of previous messages for context
            Expected format: [{"role": "user"|"assistant", "content": "..."}]

    Returns:
        AssistantResponse with content and links
    """
    agent = get_chat_assistant_agent()
    deps = ChatAssistantDeps(db=db, user_id=user_id)

    try:
        logger.info(f"Chat query: {message}")

        # Convert conversation history to Pydantic AI format
        # Pydantic AI expects message_history as a list of tuples: (role, content)
        formatted_history = []
        if conversation_history:
            logger.info(f"Conversation history length: {len(conversation_history)}")
            for msg in conversation_history:
                role = msg.get("role", "user")
                content = msg.get("content", "")

                # Skip empty messages
                if not content:
                    continue

                # Pydantic AI uses tuples (role, content)
                formatted_history.append((role, content))

            logger.info(f"Formatted {len(formatted_history)} messages for Pydantic AI")
            if formatted_history:
                logger.info(
                    f"Last message in history: role={formatted_history[-1][0]}, content={formatted_history[-1][1][:50]}..."
                )

        # Run the agent with or without history
        if formatted_history:
            logger.info(f"Passing {len(formatted_history)} messages to agent:")
            for i, (role, content) in enumerate(formatted_history):
                logger.info(f"  Message {i}: {role} - {content[:100]}...")
            result = await agent.run(message, message_history=formatted_history, deps=deps)
        else:
            logger.info("No conversation history provided or history was empty")
            result = await agent.run(message, deps=deps)

        logger.info(f"Chat response generated successfully")
        logger.info(f"Response: {result.output.content[:200]}...")
        return result.output
    except Exception as e:
        logger.error(f"Error in chat assistant: {str(e)}", exc_info=True)
        # Return a fallback response
        return AssistantResponse(
            content=f"I encountered an error processing your request. Please try rephrasing your question or visit [all threads](/threads) to browse manually.",
            links=[{"text": "Browse All Threads", "url": "/threads"}],
        )
