"""Listing Agent for Ngam-je marketplace."""

import parlant.sdk as p
import httpx
from typing import Optional

from ..config import BACKEND_API_URL


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

            # Emit event with generated content for frontend
            await context.emit_event({
                "kind": "tool_result",
                "tool": "generate_listing_content",
                "data": {
                    "title": data.get("title"),
                    "description": data.get("description"),
                    "tags": data.get("tags", [])
                }
            })

            return p.ToolResult(
                f"✅ Generated listing content!\n- Title: {data.get('title')}\n- Description: {len(data.get('description', ''))} characters\n- Tags: {len(data.get('tags', []))} tags added"
            )
    except Exception as e:
        return p.ToolResult(f"❌ Failed to generate listing content: {str(e)}")


@p.tool
async def get_listing_type_options(context: p.ToolContext) -> p.ToolResult:
    """Returns available listing types."""
    return p.ToolResult(["Buy", "Sell"])


@p.tool
async def search_product_images(context: p.ToolContext, query: str, per_page: int = 6) -> p.ToolResult:
    """
    Search for product images on Unsplash and populate the form's image field.
    This tool actually calls the backend and updates the listing form with images.

    Returns a confirmation message - the images are added to the form automatically.
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

            # Store the images in context for the frontend to pick up
            await context.emit_event({
                "kind": "tool_result",
                "tool": "search_product_images",
                "data": {
                    "images": image_urls,
                    "query": query
                }
            })

            return p.ToolResult(
                f"✅ Found {len(image_urls)} images for '{query}' and added them to your listing!"
            )
    except Exception as e:
        return p.ToolResult(f"❌ I had trouble searching for images: {str(e)}")


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

            # Emit event with generated images
            await context.emit_event({
                "kind": "tool_result",
                "tool": "generate_custom_images",
                "data": {
                    "images": image_urls,
                    "description": description
                }
            })

            return p.ToolResult(
                f"✅ Generated {len(image_urls)} custom images and added them to your listing!"
            )
    except Exception as e:
        return p.ToolResult(f"❌ Failed to generate images: {str(e)}")


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
    """Create the journey for helping users create buy listings - PRODUCT DETAILS ONLY."""
    # Create the journey
    journey = await agent.create_journey(
        title="Create Buy Listing - Product Details",
        description="Helps the user gather ONLY product details (title, description, reference images) for a buy listing. Does NOT gather price, location, or shipping - those come in later steps. This is for users who want to FIND or PURCHASE a product.",
        conditions=["The user wants to create a buy listing", "The user wants to find or purchase a product"],
    )

    # First, determine what product they want
    t0 = await journey.initial_state.transition_to(
        chat_state="Ask what specific product they're looking to buy (brand, model, type)"
    )

    # Proactively search for images based on product description
    t1 = await t0.target.transition_to(
        chat_state="Use search_product_images tool to find reference images and add them to the form. Confirm the images were added.",
        condition="The user has described the product"
    )

    # Ask about features and generate listing content
    t2 = await t1.target.transition_to(
        chat_state="Ask what specific features, specifications, or condition they're looking for in this product",
    )

    # Generate listing content with gathered information
    t3 = await t2.target.transition_to(
        chat_state="Use generate_listing_content tool to create title, description, and tags based on all the information gathered. Confirm what was generated."
    )

    # Wrap up
    t4 = await t3.target.transition_to(
        chat_state="Show a summary of what was completed: ✅ Images, ✅ Title, ✅ Description, ✅ Tags. Let them know they can now proceed to the next step for price and location."
    )
    await t4.target.transition_to(state=p.END_JOURNEY)

    # Guidelines for proactive behavior
    await journey.create_guideline(
        condition="The user describes a product",
        action="Immediately use search_product_images tool to find and add reference images to the form",
        tools=[search_product_images],
    )

    await journey.create_guideline(
        condition="The user explicitly asks to generate custom images or isn't satisfied with search results",
        action="Use generate_custom_images tool to create custom images and add them to the form",
        tools=[generate_custom_images],
    )

    await journey.create_guideline(
        condition="The user asks about price, budget, location, or shipping",
        action="Politely let them know that you're only helping with product details right now. Price, location, and shipping information will be collected in the next step of the form.",
    )

    await journey.create_guideline(
        condition="The user mentions wanting to sell a product while in the buy listing flow",
        action="Politely explain that they are currently in the BUY listing page, which is for finding products to purchase. If they want to sell a product, they need to use the SELL listing page instead. Ask if they'd like to continue with the buy listing or if they need to switch to creating a sell listing.",
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

    # Ask about product
    t0 = await journey.initial_state.transition_to(
        chat_state="Ask what product they're selling (brand, model, year, specific details)"
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

    await journey.create_guideline(
        condition="The user mentions wanting to buy or find a product while in the sell listing flow",
        action="Politely explain that they are currently in the SELL listing page, which is for selling products they own. If they want to find or purchase a product, they need to use the BUY listing page instead. Ask if they'd like to continue with the sell listing or if they need to switch to creating a buy listing.",
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

    # Create disambiguation observation
    status_inquiry = await agent.create_observation(
        "The user wants to create a listing, but it's not clear if they want to buy or sell",
    )

    # Use this observation to disambiguate between the two journeys
    await status_inquiry.disambiguate([buy_journey, sell_journey])

    # Add general guidelines
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
