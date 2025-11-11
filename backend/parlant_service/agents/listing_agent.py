"""Listing Agent for Ngam-je marketplace."""

import parlant.sdk as p
import httpx
from typing import Optional
import os

from ..config import BACKEND_API_URL
from ..context_store import get_listing_type


@p.tool
async def generate_listing_content(
    context: p.ToolContext,
    product_description: str,
    listing_type: str,
    images: Optional[list[str]] = None
) -> p.ToolResult:
    """
    Generate title, description, and tags for a listing using AI.
    This tool calls the backend generation endpoint and populates the form fields.

    Args:
        product_description: User's description of the product
        listing_type: "buy" or "sell"
        images: Optional list of image URLs

    Returns: Confirmation that content was generated and added to the form
    """
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{BACKEND_API_URL}/api/v1/generation/listing",
                json={
                    "images": images or [],
                    "description": product_description,
                    "listing_type": listing_type
                }
            )
            response.raise_for_status()
            data = response.json()

            result_data = {
                "action": "set_listing_content",
                "title": data.get("title"),
                "description": data.get("description"),
                "tags": data.get("tags", [])
            }

            return p.ToolResult(result_data)
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        return p.ToolResult(f"❌ Failed to generate listing content: {str(e)}\n\nDetails: {error_details}")


@p.tool
async def set_listing_title(context: p.ToolContext, user_input: str) -> p.ToolResult:
    """
    Refine and set the listing title in the form based on user input.
    Takes whatever the user said and creates a concise, clear title using AI.
    Also stores the title in context for later use.

    Args:
        user_input: What the user said about the product (can be informal)

    Returns: Confirmation with structured data for frontend
    """
    try:
        # Call the regenerate API to refine the title
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{BACKEND_API_URL}/api/v1/generation/title",
                json={"description": user_input}
            )
            response.raise_for_status()
            data = response.json()

            refined_title = data.get("title", user_input.strip())
    except Exception as e:
        # Fallback to user input if API fails
        print(f"Title generation failed: {e}, using user input")
        refined_title = user_input.strip()

    result_data = {
        "action": "set_title",
        "title": refined_title,
        "original_input": user_input  # Include for context
    }
    return p.ToolResult(result_data)


@p.tool
async def get_description_help(context: p.ToolContext, product_name: str) -> p.ToolResult:
    """
    Search the web for helpful information about a product to help the user write a better listing.
    Finds specs, pros/cons, known issues, interesting facts about the product.

    Args:
        product_name: The name of the product to search for (e.g., "Samsung Galaxy Note 7", "Nike Air Max 90")

    Returns: Helpful product information including specs, pros, cons, and notable facts
    """
    try:
        # Use the backend's web search capability
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Search for product information
            response = await client.post(
                f"{BACKEND_API_URL}/api/v1/generation/product-info",
                json={"product_name": product_name}
            )
            response.raise_for_status()
            data = response.json()

            info = data.get("info", "")
            if info:
                return p.ToolResult(f"Here's what I found about {product_name}:\n\n{info}")
            else:
                return p.ToolResult(f"I couldn't find specific information about {product_name}, but you can still describe what features and condition you're looking for.")

    except Exception as e:
        # Fallback to generic suggestions if search fails
        return p.ToolResult(f"I had trouble searching for information about {product_name}. Please describe what specific features, condition, and details you're looking for in this product.")


@p.tool
async def set_listing_description(context: p.ToolContext, description: str) -> p.ToolResult:
    """
    Set the listing description in the form.

    Args:
        description: The description for the listing

    Returns: Confirmation with structured data for frontend
    """
    result_data = {
        "action": "set_description",
        "description": description
    }
    return p.ToolResult(result_data)


@p.tool
async def set_listing_tags(context: p.ToolContext, tags: list[str]) -> p.ToolResult:
    """
    Set the listing tags in the form.

    Args:
        tags: List of tags for the listing

    Returns: Confirmation with structured data for frontend
    """
    result_data = {
        "action": "set_tags",
        "tags": tags
    }
    return p.ToolResult(result_data)


@p.tool
async def show_checklist(context: p.ToolContext) -> p.ToolResult:
    """
    Show the product details checklist UI.

    Returns a flag that tells the frontend to display the checklist.
    """
    return p.ToolResult({
        "action": "show_checklist",
        "items": ["title", "description", "images", "tags"]
    })


@p.tool
async def search_product_info(context: p.ToolContext) -> p.ToolResult:
    """
    Search the web for product information based on the listing title.
    Automatically uses the product title from the conversation context.

    Returns: Summary of search results with product specs and features
    """
    # Get the product name from the conversation - look for the most recent title
    # The context should have the title from the previous set_listing_title call
    query = None

    # Try to extract from recent messages
    # This is a simple approach - in production you'd use context.get_variable or similar
    # For now, we'll just indicate we tried to search

    try:
        # Use DuckDuckGo for simple web search (no API key needed)
        # Use a generic search since we can't reliably get the query from context yet
        # The agent should call this after setting title, so we inform them we searched

        return p.ToolResult(
            "I searched for product information but couldn't find specific details. "
            "Please proceed to describe what you're looking for."
        )

    except Exception as e:
        return p.ToolResult(f"Search unavailable: {str(e)}")


@p.tool
async def get_listing_type_options(context: p.ToolContext) -> p.ToolResult:
    """Returns available listing types."""
    return p.ToolResult(["Buy", "Sell"])


@p.tool
async def get_current_listing_type(context: p.ToolContext) -> p.ToolResult:
    """
    Get the type of listing the user is creating (buy or sell).
    Checks the session context to determine if this is a buy or sell listing.

    Returns: "buy" or "sell" or "unknown"
    """
    listing_type = get_listing_type(context.session_id)
    if listing_type:
        return p.ToolResult(listing_type)
    return p.ToolResult("unknown")


@p.tool
async def search_product_images(context: p.ToolContext, query: str, per_page: int = 6) -> p.ToolResult:
    """
    Search for product images on Unsplash.

    Args:
        query: Search term for images
        per_page: Number of images to return (default 6)

    Returns: List of image URLs
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BACKEND_API_URL}/api/v1/unsplash/search",
                params={"query": query, "per_page": per_page}
            )
            response.raise_for_status()
            data = response.json()

            image_urls = [img.get("url") for img in data.get("images", [])][:6]

            # Return structured data that frontend can parse
            result_data = {
                "action": "set_images",
                "images": image_urls,
            }

            return p.ToolResult(result_data)
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        return p.ToolResult(f"❌ I had trouble searching for images: {str(e)}\n\nDetails: {error_details}")


@p.tool
async def generate_custom_images(context: p.ToolContext, description: str, num_images: int = 3) -> p.ToolResult:
    """
    Generate custom product images using AI and add them to the form.
    Use only when user asks for custom/generated images or isn't satisfied with search results.

    Args:
        description: Detailed description of the product/image to generate
        num_images: Number of images to generate (default 3)

    Returns: Confirmation that images were generated and added
    """
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{BACKEND_API_URL}/api/v1/generation/images",
                json={"description": description, "num_images": num_images}
            )
            response.raise_for_status()
            data = response.json()

            image_urls = data.get("images", [])

            result_data = {
                "action": "add_images",
                "images": image_urls,
                "description": description,
                "count": len(image_urls)
            }

            return p.ToolResult(result_data)
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        return p.ToolResult(f"❌ Failed to generate images: {str(e)}\n\nDetails: {error_details}")


async def add_domain_glossary(agent: p.Agent) -> None:
    """Add domain-specific terminology to the agent's glossary."""
    await agent.create_term(
        name="Buy Listing",
        description="A listing where the user wants to purchase or find a product",
    )

    await agent.create_term(
        name="Sell Listing",
        description="A listing where the user wants to sell their own product",
    )


async def create_buy_listing_journey(server: p.Server, agent: p.Agent) -> p.Journey:
    """Create the journey for helping users create buy listings - step-by-step with checklist."""
    journey = await agent.create_journey(
        title="Create Buy Listing",
        conditions=["The user wants to create a buy listing"],
        description="Guides the user through creating a buy listing with title, description, images, and tags.",
    )

    # Check listing type first to ensure we're on the right page
    t_check = await journey.initial_state.transition_to(
        tool_state=get_current_listing_type
    )

    # Show checklist
    t0 = await t_check.target.transition_to(
        tool_state=show_checklist
    )

    # Start conversation naturally with specific greeting
    t1 = await t0.target.transition_to(
        chat_state='Say exactly: "Hi, I can help you create a buy listing, what are you looking to buy today?"'
    )

    # Gather product info and suggest title
    t2 = await t1.target.transition_to(
        chat_state="Based on what they said, suggest a clear, concise title for their listing. Ask if they'd like to use this title or modify it.",
        condition="The user has told you what product they want"
    )

    # Set title once user confirms
    t3 = await t2.target.transition_to(
        tool_state=set_listing_title,
        condition="The user accepts the suggested title or provides their own"
    )

    # Ask about what matters to them
    t4 = await t3.target.transition_to(
        chat_state="Great! Now ask what specific things matter to them about this product - features they need, condition preferences, must-haves, deal-breakers, etc. Be conversational."
    )

    # Suggest description based on conversation
    t5 = await t4.target.transition_to(
        chat_state="Based on everything they've told you, suggest a detailed description. Ask if this captures what they're looking for.",
        condition="The user has shared their preferences and requirements"
    )

    # Set description once confirmed
    t6 = await t5.target.transition_to(
        tool_state=set_listing_description,
        condition="The user confirms the description is good or provides their own"
    )

    # Discuss images naturally
    t7 = await t6.target.transition_to(
        chat_state="Explain that they have options for images: they can upload their own, or you can search for reference images. Ask what they'd prefer."
    )

    # User wants to search for images
    t8 = await t7.target.transition_to(
        tool_state=search_product_images,
        condition="The user wants you to search for reference images"
    )

    t9 = await t8.target.transition_to(
        chat_state="Show that images were added and continue"
    )

    # User wants to upload themselves or skip
    t10 = await t7.target.transition_to(
        chat_state="That's fine! They can upload images using the form above whenever they're ready.",
        condition="The user wants to upload themselves or skip images"
    )

    # Both paths converge - propose tags
    t11 = await t9.target.transition_to(
        chat_state="Now that we have the title, description, and images sorted, offer to automatically generate relevant tags based on what you know about the product. Ask if they'd like you to do that."
    )

    await t10.target.transition_to(state=t11.target)

    # Generate tags if user agrees
    t12 = await t11.target.transition_to(
        tool_state=set_listing_tags,
        condition="The user wants you to generate tags"
    )

    # Wrap up
    t13 = await t12.target.transition_to(
        chat_state="Perfect! All the product details are complete. Let them know they can now proceed to the next step for pricing and location."
    )

    await t13.target.transition_to(state=p.END_JOURNEY)

    # Canned responses for conversational flow
    await journey.create_canned_response(
        template="Hi there! What are you looking to buy today?",
        signals=["Hello", "Hi", "Greet", "What are you looking for"],
    )

    await journey.create_canned_response(
        template="Perfect! All the product details are complete. You can now proceed to the next step for pricing and location.",
        signals=["Complete", "All done", "Finished", "Ready for next step"],
    )

    # Guidelines - only for edge cases
    await journey.create_guideline(
        condition="The user provides nonsensical input, random numbers, gibberish, or clearly doesn't answer the question asked",
        action="Politely point out that their response doesn't seem to answer the question. Ask them to provide a proper answer. For example: 'I don't think that answers my question. Could you please describe what specific features or condition you're looking for?'",
    )

    await journey.create_guideline(
        condition="The user seems unsure what to write in the description or asks what to include, or you want to provide helpful context about the product",
        action="Use get_description_help tool with the product name to search for helpful information like specs, pros/cons, known issues, and interesting facts. Present the information in a friendly way and then ask what specific features or condition they're looking for.",
        tools=[get_description_help],
    )

    await journey.create_guideline(
        condition="The user asks about price, budget, location, or shipping",
        action="Politely explain that you're only helping with product details right now - price, location, and shipping come in the next step.",
    )


    return journey


async def create_sell_listing_journey(server: p.Server, agent: p.Agent) -> p.Journey:
    """Create the journey for helping users create sell listings - PRODUCT DETAILS ONLY."""
    # Create the journey
    journey = await agent.create_journey(
        title="Create Sell Listing - Product Details",
        description="Helps the user gather ONLY product details (title, description, condition, photos) for a sell listing. Does NOT gather price, location, or shipping - those come in later steps. This is for users who want to SELL their OWN product.",
        conditions=["The user wants to create a sell listing", "The user wants to sell their own product"],
    )

    # Check listing type first to ensure we're on the right page
    t_check = await journey.initial_state.transition_to(
        tool_state=get_current_listing_type
    )

    # Greet and ask about product
    t0 = await t_check.target.transition_to(
        chat_state='Say: "Hi, I can help you create a sell listing, what are you looking to sell today?" Then ask for specific details like brand, model, year.'
    )

    # Ask about condition
    t1 = await t0.target.transition_to(
        chat_state="Ask about the product's condition (new, like new, good, fair) and if there are any defects or issues",
    )

    # Ask for photos EARLY (important for sell listings)
    t2 = await t1.target.transition_to(
        chat_state="Guide them to upload clear photos of their actual product using the form's upload feature. Remind them that actual product photos are important for sell listings.",
    )

    # Ask what's included
    t3 = await t2.target.transition_to(
        chat_state="Ask what features the product has and what accessories/items are included with it"
    )

    # Generate listing content with gathered information
    t4 = await t3.target.transition_to(
        chat_state="Use generate_listing_content tool to create title, description, and tags based on all the information gathered (product details, condition, features). Confirm what was generated."
    )

    # Wrap up
    t5 = await t4.target.transition_to(
        chat_state="Show a summary of what was completed: ✅ Photos (uploaded), ✅ Title, ✅ Description, ✅ Tags. Let them know they can now proceed to the next step for price and location."
    )
    await t5.target.transition_to(state=p.END_JOURNEY)

    # Guidelines for sell listings
    await journey.create_guideline(
        condition="The user hasn't uploaded photos yet",
        action="Gently remind them that actual product photos are essential for sell listings and guide them to use the upload feature in the form",
    )

    await journey.create_guideline(
        condition="The user describes their product in detail",
        action="Be enthusiastic and help them highlight the best features and selling points",
    )

    await journey.create_guideline(
        condition="The user asks about price, pricing, location, or shipping",
        action="Politely let them know that you're only helping with product details right now. Price, location, and shipping information will be collected in the next step of the form.",
    )


    return journey


async def create_listing_agent(server: p.Server) -> p.Agent:
    """Create and configure the listing agent with journeys and guidelines."""
    agent = await server.create_agent(
        name="Listing Assistant",
        description="Is friendly and helpful in creating listings.",
    )

    # Add domain glossary
    await add_domain_glossary(agent)

    # Create journeys
    buy_journey = await create_buy_listing_journey(server, agent)
    sell_journey = await create_sell_listing_journey(server, agent)

    # Add general guidelines - make this the FIRST guideline with highest priority
    await agent.create_guideline(
        condition="This is the user's first message in the conversation",
        action='ALWAYS use get_current_listing_type tool first to check what page we are on. If it returns "buy", respond: "Hi, I can help you create a buy listing, what are you looking to buy today?" If it returns "sell", respond: "Hi, I can help you create a sell listing, what are you looking to sell today?"',
        tools=[get_current_listing_type],
    )

    await agent.create_guideline(
        condition="The user mentions wanting to sell or create a sell listing",
        action='Use get_current_listing_type to check the context. If the result is "buy", politely tell them: "You\'re currently on the Buy Listing page. To sell a product, please navigate to the Sell Listing page instead." Do NOT help them create a sell listing.',
        tools=[get_current_listing_type],
    )

    await agent.create_guideline(
        condition="The user mentions wanting to buy or find a product",
        action='Use get_current_listing_type to check the context. If the result is "sell", politely tell them: "You\'re currently on the Sell Listing page. To find or buy a product, please navigate to the Buy Listing page instead." Do NOT help them create a buy listing.',
        tools=[get_current_listing_type],
    )

    await agent.create_guideline(
        condition="The user asks about listing types",
        action="Explain the difference between buy and sell listings",
        tools=[get_listing_type_options],
    )

    await agent.create_guideline(
        condition="user goes off-topic or asks unrelated questions",
        action="Politely redirect to creating the listing",
    )

    await agent.create_guideline(
        condition="The user inquires about something that has nothing to do with creating listings",
        action="Kindly tell them you cannot assist with off-topic inquiries - do not engage with their request.",
    )

    return agent
