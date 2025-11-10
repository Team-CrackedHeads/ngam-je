"""Listing Agent for Ngam-je marketplace."""

import parlant.sdk as p
import httpx
from typing import Optional

from ..config import BACKEND_API_URL


@p.tool
async def get_listing_type_options(context: p.ToolContext) -> p.ToolResult:
    """Returns available listing types."""
    return p.ToolResult(["Buy", "Sell"])


@p.tool
async def search_unsplash_images(context: p.ToolContext, query: str, per_page: int = 6) -> p.ToolResult:
    """Search for product images on Unsplash based on a query. Returns markdown-formatted images to display."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BACKEND_API_URL}/api/v1/unsplash/search",
                params={"query": query, "per_page": per_page}
            )
            response.raise_for_status()
            data = response.json()

            # Return markdown-formatted images for display
            image_urls = [img.get("url") for img in data.get("images", [])]

            # Format as markdown images in a grid (2 columns)
            markdown_images = "\n\n".join([
                f"![{query} {i+1}]({url})"
                for i, url in enumerate(image_urls[:6])  # Show max 6 images
            ])

            return p.ToolResult(
                f"Here are some images of '{query}' I found:\n\n{markdown_images}\n\nDo any of these match what you're looking for?"
            )
    except Exception as e:
        return p.ToolResult(f"I had trouble searching for images: {str(e)}")


@p.tool
async def generate_images_with_ai(context: p.ToolContext, description: str, num_images: int = 3) -> p.ToolResult:
    """Generate custom product images using AI based on a detailed text description. Use only when user asks for custom/generated images."""
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{BACKEND_API_URL}/api/v1/generation/images",
                json={"description": description, "num_images": num_images}
            )
            response.raise_for_status()
            data = response.json()

            image_urls = data.get("images", [])

            # Format as markdown images
            markdown_images = "\n\n".join([
                f"![Generated {description} {i+1}]({url})"
                for i, url in enumerate(image_urls)
            ])

            return p.ToolResult(
                f"I've generated {len(image_urls)} custom images based on your description:\n\n{markdown_images}\n\nWhat do you think of these?"
            )
    except Exception as e:
        return p.ToolResult(f"I had trouble generating images: {str(e)}")


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
        chat_state="Use search_unsplash_images tool to find reference images based on the product they described. Show them the images and ask if these look like what they're searching for.",
        condition="The user has described the product"
    )

    # Ask about features and specifications
    t2 = await t1.target.transition_to(
        chat_state="Ask what specific features, specifications, or condition they're looking for in this product",
    )

    # Wrap up - NO price or location questions
    t3 = await t2.target.transition_to(
        chat_state="Summarize the product details (what they're looking for, features, and reference images). Let them know that price and location will be handled in the next step of the form."
    )
    await t3.target.transition_to(state=p.END_JOURNEY)

    # Guidelines for proactive behavior
    await journey.create_guideline(
        condition="The user describes a product",
        action="Immediately search for reference images using search_unsplash_images tool to show them visual examples",
        tools=[search_unsplash_images],
    )

    await journey.create_guideline(
        condition="The user explicitly asks to generate custom images or isn't satisfied with search results",
        action="Offer to use generate_images_with_ai tool to create custom images, or search again with different terms",
        tools=[search_unsplash_images, generate_images_with_ai],
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

    # Wrap up - NO price or location questions
    t4 = await t3.target.transition_to(
        chat_state="Summarize the product details (what they're selling, condition, features, and photos). Let them know that price, location, and shipping will be handled in the next step of the form."
    )
    await t4.target.transition_to(state=p.END_JOURNEY)

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
