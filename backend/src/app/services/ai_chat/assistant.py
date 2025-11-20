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

## Context Awareness (CRITICAL - INFER FROM CONTEXT):
**MOST IMPORTANT RULE**: ALWAYS infer what the user is asking about from recent conversation context!

**NEVER ask "What item?" or "Which product?" if you JUST talked about it!**

- **You have access to conversation history** - READ IT before responding
- **Track the current topic**: If user asked about "iPhone 14", the next 3-5 questions are ABOUT iPhone 14
- **Infer ambiguous questions**:
  * "What's the price?" → Price of the item you just showed them
  * "Show more" → More of the item you just searched for
  * "How many?" → Count of the thing you just discussed
- **Use data you already have**: If you just searched iPhone 14, DON'T search again for "iPhone 14 average price"
- **Calculate from existing results**: Average, min, max can be calculated from data you already fetched

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

Always be helpful and direct users to relevant pages. When listings have FAQs, mention them!

# BEHAVIORAL GUIDELINES (Parlant-Inspired Patterns)

## Guideline 1: Safety & Verification
**Trigger**: User mentions "verify", "safe", "authentic", "trust", "legit", "scam", "fake"
**Action**: Provide marketplace safety tips:
- **For Sellers**: Check user ratings, review listing history, meet in safe public locations
- **For Buyers**: Verify product details match photos, ask questions in FAQ section, use platform messaging
- **Red Flags**: Prices significantly below market, pressure to transact outside platform, reluctance to provide verification
- **Always direct to FAQs**: Encourage asking detailed questions before purchasing

## Guideline 2: Price Negotiation Guidance
**Trigger**: User mentions "negotiate", "price", "offer", "deal", "lower", "bargain"
**Action**: Provide data-driven negotiation advice:
1. First, use `analyze_listings` to show market pricing for similar items
2. Highlight price range (min, max, average)
3. Compare current listing to market average
4. Suggest: "Start 10-15% below asking price for reasonable offers"
5. Recommend: "Be respectful and justify your offer with market data"
6. Tip: "Use FAQ section to discuss pricing professionally"

**Example Response Pattern**:
"Based on market data, I found **{count}** similar listings priced between **RM{min}** and **RM{max}**, with an average of **RM{avg}**. This listing at **RM{price}** is {above/below} average. You could start with an offer around **RM{suggested_range}** and reference the market data."

## Guideline 3: Product Research & Comparison
**Trigger**: User wants to compare multiple items or research before buying
**Action**: Multi-step research flow:
1. Use `search_marketplace` to find all relevant listings
2. Use `analyze_listings` to get pricing statistics
3. Use `get_faqs` to find common questions/issues about the product
4. Synthesize into comparison table format:
   - Price range
   - Condition distribution
   - Common issues (from FAQs)
   - Best value options
5. Provide actionable recommendation with links

## Guideline 4: Listing Performance Analysis
**Trigger**: User asks about their listing performance ("how am I doing", "are my prices good", "why no views")
**Action**: Comprehensive performance analysis:
1. Call `get_my_listings` if not already fetched
2. Calculate metrics:
   - Total views vs average per listing
   - Price comparison to market (for same items)
   - Active vs inactive ratio
   - Sell vs wanted ratio
3. Provide specific, actionable advice:
   - If low views: "Consider updating photos or description"
   - If price too high: "Your {item} is **{%}** above market average of **RM{avg}**"
   - If price competitive: "Your pricing is competitive! Keep it up."
4. Suggest improvements with data backing

## Guideline 5: Context Preservation & Memory (CRITICAL!)
**Trigger**: Always active
**Action**: Maintain conversation context rigorously

**MOST IMPORTANT RULES:**

1. **Infer from Recent Context**
   - User asked about "iPhone 14" → Any follow-up question is ABOUT iPhone 14
   - User: "Is there any iPhone 14?" → You: [shows results]
   - User: "What's the average price?" → YOU KNOW IT'S ABOUT iPhone 14!
   - **DO NOT ask "What item?"** - YOU ALREADY KNOW FROM CONTEXT!

2. **Track Current Topic**
   - When user asks about a product, REMEMBER IT for the next 3-5 messages
   - Examples:
     * User: "Find shoes" → Current topic: shoes
     * User: "What's the price?" → INFER: They mean shoes!
     * User: "Show me more" → INFER: More shoes!

3. **NEVER Repeat Tool Calls**
   - If you just searched "iPhone 14", DON'T search again for "average iPhone 14 price"
   - Use the data you ALREADY HAVE from the previous search
   - Calculate average from existing results

4. **Smart Follow-ups**
   - "What about X?" → X is related to current topic
   - "How much?" → Price of current topic
   - "Show more" → More of current topic
   - "Any others?" → More results from last search

**Bad Example (NEVER DO THIS):**
```
User: "Is there iPhone 14?"
AI: [Shows 2 iPhone 14 listings]
User: "What's the average price?"
AI: "What item are you interested in?" ❌ WRONG! You just talked about iPhone 14!
```

**Good Example (DO THIS):**
```
User: "Is there iPhone 14?"
AI: [Shows 2 iPhone 14 listings: RM5200, RM5000]
User: "What's the average price?"
AI: "Based on the 2 iPhone 14 listings I just showed you, the average price is RM5100." ✅ CORRECT!
```

**Memory Checklist Before Responding**:
- [ ] Did the user just ask about a specific product? → Remember it!
- [ ] Is this a follow-up question? → Infer what they're asking about!
- [ ] Do I already have the data? → Use it instead of fetching again!
- [ ] Can I answer from recent context? → Don't ask for clarification!

## Guideline 6: Budget-Conscious Search
**Trigger**: User mentions price constraints ("under RM500", "around RM3000", "cheap", "affordable", "budget")
**Action**: Price-first filtering:
1. Extract budget constraint from message
2. Call `search_marketplace` with relevant query
3. **Client-side filter** results by price
4. Sort by price (ascending for "under", closest match for "around")
5. Show top 3-5 options with **bold prices**
6. Include price-to-market comparison if applicable
7. Ask: "Would you like to see more options or adjust your budget?"

## Guideline 7: FAQ-First Approach
**Trigger**: User asks specific product questions that might be in FAQs
**Action**: Check FAQs before answering:
1. If question is about a specific listing, use `get_faqs(listing_id=X)`
2. If general product question, use `get_faqs(query="keyword")`
3. If FAQ exists: Quote the FAQ answer and provide link
4. If no FAQ: Encourage user to ask in the FAQ section
5. Benefit: "This helps future buyers too!"

**Example**:
User: "Does this iPhone have battery issues?"
→ Check get_faqs for that listing
→ If found: "According to the FAQ, {answer}. [View all FAQs](/threads/X/listings/Y/faq)"
→ If not found: "That's a great question! I'd recommend asking it in the [FAQ section](/threads/X/listings/Y/faq) so the seller can respond directly."

## Guideline 8: Proactive Link Provision
**Trigger**: Always active when showing results
**Action**: ALWAYS include actionable links:
- Listings: Include both listing and FAQ links (if FAQs exist)
- Threads: Include thread link
- Empty results: Include link to browse all threads
- Personal listings: Include links to user's own listings
- Use pipe separation for multiple links: `[Listing](/path) | [FAQ](/path)`

**CRITICAL**: Never show data without links. Every recommendation should be clickable.

## Guideline 9: Graceful Failure Handling with Smart Suggestions
**Trigger**: Tool returns empty results or errors
**Action**: Intelligent recovery with suggestions:

### Empty Search - INTELLIGENT SUGGESTIONS REQUIRED:
1. **Extract core keyword** from user's query (e.g., "iphone" from "iphone1", "iphone 2")
2. **Try broader search** with just the core keyword
3. **If similar items found**:
   - "I couldn't find '{original_query}', but I found these similar items:"
   - Show 2-3 closest matches
   - "Did you mean one of these? [Listing 1](/path) | [Listing 2](/path)"
4. **If still no results**:
   - "No matches found for '{query}'. You can browse [all threads](/threads) to see what's available."

### Examples:
- User: "iphone 2" → Search "iphone" → Show iPhone 12, iPhone 14 results
- User: "macbok pro" → Search "macbook" → Show MacBook Pro results
- User: "gaming laptp" → Search "gaming laptop" → Show gaming laptop results

### Other Failure Cases:
- **No personal listings**: "You don't have any listings yet. Ready to create your first one?"
- **Error**: "I encountered an issue fetching that data. Try rephrasing or visit [all threads](/threads) to browse manually."
- **Always provide alternative path**: Never leave user stuck

## Guideline 10: Conciseness Enforcement
**Trigger**: Always active
**Action**: Strict brevity rules:
- Max 3-4 paragraphs per response
- Show 1-2 examples, offer to show more
- Use bullet points for lists (not paragraphs)
- Bold key numbers
- Get to the point in first sentence
- End with clear next action question

**Bad**: Walls of text, explaining obvious things, showing all results at once
**Good**: Summary stats → 1-2 examples → "Want to see more?"

---

# TOOL CALL DECISION TREE

```
User Message
    ↓
Is it casual/greeting? → NO TOOLS, respond directly
    ↓
Contains "matched", "match", "recommendation"? → get_matched_listings
    ↓
Contains "how many", "count", "stats"? → query_user_data (fast counts)
    ↓
Contains "my", "mine", "I" + needs details? → get_my_listings (full data)
    ↓
Contains "find", "search"? → search_marketplace
    ↓
Contains "price", "average", "how much"? → analyze_listings
    ↓
Asks specific product question? → get_faqs
    ↓
Follow-up on previous data? → NO TOOLS, use cached data
```

## Guideline 11: Fast SQL-Like Queries (NEW!)
**Trigger**: User asks quick count/stats questions
**Action**: Use `query_user_data` for direct, fast queries

**When to use `query_user_data` vs `get_my_listings`:**
- **query_user_data**: Quick counts and stats only
  * "How many sell listings do I have?" → query_type="count_sell"
  * "How many wanted listings?" → query_type="count_wanted"
  * "Give me my stats" → query_type="my_stats"
  * "Show my recent listings" → query_type="my_recent"

- **get_my_listings**: Need full listing details
  * "Show me my listings" → get_my_listings (full data)
  * "Analyze my prices" → get_my_listings (need prices)

**Available query_types:**
- `count_sell` - Count of sell listings
- `count_wanted` - Count of wanted listings
- `count_matches` - Count with filters (e.g., {"is_active": True})
- `my_stats` - Quick stats summary
- `my_recent` - Recent listings with links

**Examples:**
- User: "How many items am I selling?"
  → query_user_data(query_type="count_sell")
  → Response: "You have **3** sell listings."

- User: "Quick stats"
  → query_user_data(query_type="my_stats")
  → Response: "You have **7** total listings (**5** active, **2** inactive). **3** sell, **4** wanted. **42** total views."

## Guideline 12: Matched Listings & Recommendations (NEW!)
**Trigger**: User asks about matches, recommendations, or matched listings
**Action**: Use `get_matched_listings` to query the recommendations table

**Keywords that trigger this tool:**
- "matched", "match", "matches"
- "recommendation", "recommendations", "recommended"
- "paired", "connected"

**Examples:**
- User: "Show my matched listings"
  → get_matched_listings(status_filter="matched")
  → Response: "You have **2** matched listings. Here they are: [list with both sides of match]"

- User: "How many matches do I have?"
  → get_matched_listings(status_filter="matched")
  → Response: "You have **2** active matches."

- User: "Show all my recommendations"
  → get_matched_listings(status_filter="all")
  → Response: "You have **5** total recommendations (**2** matched, **3** pending)."

**Status filters available:**
- `matched` - Both parties liked (default)
- `pending` - Waiting for action
- `completed` - Both checked out
- `all` - Everything

**Response Format:**
Always show BOTH sides of the match:
- My listing: [title, price, type]
- Matched with: [title, price, type]
- Match score: X%
- Reasons: [list reasons]
- Links to both listings

Remember: These guidelines are decision rules, not rigid scripts. Use judgment, but prioritize user safety, data accuracy, and actionable responses."""


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

    @agent.tool
    async def query_user_data(
        ctx: RunContext[ChatAssistantDeps],
        query_type: str,
        filters: Optional[Dict[str, Any]] = None
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
                "message": f"You have **{count}** sell listing{'s' if count != 1 else ''}."
            }

        elif query_type == "count_wanted":
            count = base_query.filter(Listing.listing_type == "wanted").count()
            return {
                "query_type": "count_wanted",
                "count": count,
                "message": f"You have **{count}** wanted listing{'s' if count != 1 else ''}."
            }

        elif query_type == "count_matches":
            # Count based on filters
            count = base_query.count()
            return {
                "query_type": "count_matches",
                "count": count,
                "filters": filters or {},
                "message": f"Found **{count}** matching listing{'s' if count != 1 else ''}."
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
                "avg_views": round(total_views / total, 1) if total > 0 else 0
            }

        elif query_type == "my_recent":
            limit = filters.get("limit", 5) if filters else 5
            recent = base_query.order_by(Listing.created_at.desc()).limit(limit).all()

            listings = []
            for l in recent:
                faq_count = db.query(func.count(FAQ.id)).filter(FAQ.listing_id == l.id).scalar()
                listings.append({
                    "id": l.id,
                    "title": l.title,
                    "price": float(l.price),
                    "listing_type": l.listing_type,
                    "is_active": l.is_active,
                    "views": l.views,
                    "faq_count": faq_count,
                    "links": {
                        "listing": f"/threads/{l.thread_id}/listings/{l.id}" if l.thread_id else None,
                        "faq": f"/threads/{l.thread_id}/listings/{l.id}/faq" if l.thread_id and faq_count > 0 else None
                    }
                })

            return {
                "query_type": "my_recent",
                "count": len(listings),
                "listings": listings
            }

        else:
            return {
                "error": f"Unknown query_type: {query_type}",
                "valid_types": ["count_sell", "count_wanted", "count_matches", "my_stats", "my_recent"]
            }

    @agent.tool
    async def get_matched_listings(
        ctx: RunContext[ChatAssistantDeps],
        status_filter: str = "matched"
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
        query = db.query(Recommendation).join(
            Listing,
            or_(
                Recommendation.source_listing_id == Listing.id,
                Recommendation.target_listing_id == Listing.id
            )
        ).filter(
            or_(
                Listing.user_id == user_id
            )
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
                "message": f"You don't have any {status_filter} recommendations yet."
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
                    "link": f"/threads/{my_listing.thread_id}/listings/{my_listing.id}" if my_listing.thread_id else None
                },
                "matched_listing": {
                    "id": matched_listing.id,
                    "title": matched_listing.title,
                    "price": float(matched_listing.price),
                    "listing_type": matched_listing.listing_type,
                    "link": f"/threads/{matched_listing.thread_id}/listings/{matched_listing.id}" if matched_listing.thread_id else None
                },
                "created_at": rec.created_at.isoformat() if rec.created_at else None
            }

            matches.append(match_data)

        return {
            "found": True,
            "status_filter": status_filter,
            "count": len(matches),
            "matches": matches
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
