"""Sell Listing Agent - Helps users create sell listings for products they own."""

import parlant.sdk as p
import httpx
from datetime import datetime

from ..config import BACKEND_API_URL


@p.tool
async def set_listing_title(context: p.ToolContext, title: str) -> p.ToolResult:
    """Set the listing title in the form."""
    return p.ToolResult(
        data={"action": "set_title", "title": title.strip()},
        metadata={"step": "title", "timestamp": datetime.now().isoformat()},
        canned_response_fields={"title": title.strip()}
    )


@p.tool
async def set_listing_description(context: p.ToolContext, description: str) -> p.ToolResult:
    """Set the listing description in the form."""
    return p.ToolResult(
        data={"action": "set_description", "description": description},
        metadata={"step": "description", "timestamp": datetime.now().isoformat()},
        canned_response_fields={"description": description}
    )


@p.tool
async def set_listing_tags(context: p.ToolContext, tags: list[str]) -> p.ToolResult:
    """Set the listing tags in the form."""
    return p.ToolResult(
        data={"action": "set_tags", "tags": tags},
        metadata={"step": "tags", "tag_count": len(tags), "timestamp": datetime.now().isoformat()},
        canned_response_fields={"tags": tags, "tag_count": len(tags), "tags_list": ", ".join(tags)}
    )


@p.tool
async def generate_title(context: p.ToolContext, product_context: str) -> p.ToolResult:
    """
    Generate a listing title using AI based on the product context.

    Args:
        product_context: Context about the product (name, condition, features)

    Returns: Generated title
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{BACKEND_API_URL}/api/v1/generation/title",
                json={"context": {"description": product_context}}
            )
            response.raise_for_status()
            data = response.json()
            return p.ToolResult(f"Generated title: {data.get('title')}")
    except Exception as e:
        return p.ToolResult(f"Failed to generate title: {str(e)}")


@p.tool
async def generate_description(context: p.ToolContext, product_context: str) -> p.ToolResult:
    """
    Generate a listing description using AI based on the product context.

    Args:
        product_context: Context about the product (condition, features, accessories)

    Returns: Generated description
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{BACKEND_API_URL}/api/v1/generation/description",
                json={"context": {"description": product_context}}
            )
            response.raise_for_status()
            data = response.json()
            return p.ToolResult(f"Generated description: {data.get('description')}")
    except Exception as e:
        return p.ToolResult(f"Failed to generate description: {str(e)}")


@p.tool
async def generate_tags(context: p.ToolContext, product_context: str) -> p.ToolResult:
    """
    Generate listing tags using AI based on the product context.

    Args:
        product_context: Context about the product (title, description, features)

    Returns: Generated tags
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{BACKEND_API_URL}/api/v1/generation/tags",
                json={"context": {"description": product_context}}
            )
            response.raise_for_status()
            data = response.json()
            tags = data.get('tags', [])
            return p.ToolResult(f"Generated tags: {', '.join(tags)}")
    except Exception as e:
        return p.ToolResult(f"Failed to generate tags: {str(e)}")


@p.tool
async def generate_images(context: p.ToolContext, description: str, num_images: int = 4) -> p.ToolResult:
    """
    Generate product images using AI based on description.

    Args:
        description: Description of the product/images to generate
        num_images: Number of images to generate (default 4)

    Returns: Generated image URLs
    """
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{BACKEND_API_URL}/api/v1/generation/images",
                json={
                    "description": description,
                    "num_images": num_images
                }
            )
            response.raise_for_status()
            data = response.json()
            image_urls = data.get("images", [])

            return p.ToolResult({
                "action": "set_images",
                "images": image_urls,
            })
    except Exception as e:
        return p.ToolResult(f"Failed to generate images: {str(e)}")


@p.tool
async def search_product_images(context: p.ToolContext, query: str, per_page: int = 6) -> p.ToolResult:
    """Search for product images on Unsplash."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BACKEND_API_URL}/api/v1/unsplash/search",
                params={"query": query, "per_page": per_page}
            )
            response.raise_for_status()
            data = response.json()
            image_urls = [img.get("url") for img in data.get("images", [])][:6]

            return p.ToolResult({
                "action": "set_images",
                "images": image_urls,
            })
    except Exception as e:
        return p.ToolResult(f"I had trouble searching for images: {str(e)}")


@p.tool
async def show_checklist(context: p.ToolContext) -> p.ToolResult:
    """Show the product details checklist UI."""
    return p.ToolResult(
        data={"action": "show_checklist", "items": ["title", "description", "images", "tags"]},
        metadata={"ui_action": "show_checklist", "timestamp": datetime.now().isoformat()}
    )


async def create_sell_listing_agent(server: p.Server) -> p.Agent:
    """Create the Sell Listing Agent with its journey."""
    agent = await server.create_agent(
        name="Sell Listing Assistant",
        description="Helps users create sell listings for products they own and want to sell.",
    )

    # ========== GLOSSARY TERMS ==========
    await agent.create_term(
        name="Sell Listing",
        description="A listing where the user is selling their own product to potential buyers",
    )

    await agent.create_term(
        name="Condition",
        description="The physical state of a product: New (unopened/unused), Like New (minimal use, excellent condition), Good (normal wear, fully functional), Fair (visible wear but still works)",
    )

    await agent.create_term(
        name="Actual Product Photos",
        description="Real photos of the specific item being sold, not stock images. Essential for sell listings to build buyer trust.",
    )

    await agent.create_term(
        name="Meetup",
        description="A face-to-face transaction where buyer and seller meet in person to exchange the product and payment",
    )

    await agent.create_term(
        name="COD",
        description="Cash on Delivery - payment method where buyer pays cash when receiving the product",
    )

    # ========== CONTEXT VARIABLES ==========
    marketplace_var = await agent.create_variable(
        name="marketplace_name",
        description="The name of the marketplace platform"
    )

    await marketplace_var.set_value_for_customer(
        customer=p.Customer.guest,
        value="Ngam-je"
    )

    current_date_var = await agent.create_variable(
        name="current_date",
        description="Today's date for context"
    )

    await current_date_var.set_value_for_customer(
        customer=p.Customer.guest,
        value=datetime.now().strftime("%B %d, %Y")
    )

    listing_type_var = await agent.create_variable(
        name="listing_type",
        description="The type of listing being created"
    )

    await listing_type_var.set_value_for_customer(
        customer=p.Customer.guest,
        value="sell"
    )

    # ========== CANNED RESPONSES - Agent-level ==========
    greeting_response = await agent.create_canned_response(
        template="Hi! I'm here to help you create a sell listing on {{std.variables.marketplace_name}}. What product are you looking to sell?"
    )

    title_set_response = await agent.create_canned_response(
        template="Perfect! I've set your listing title to: \"{{title}}\""
    )

    description_set_response = await agent.create_canned_response(
        template="Great! I've added that description to your listing."
    )

    tags_set_response = await agent.create_canned_response(
        template="Awesome! I've added {{tag_count}} tags: {{tags_list}}"
    )

    # Create the sell listing journey
    journey = await agent.create_journey(
        title="Create Sell Listing",
        conditions=["User wants help creating a sell listing"],
        description="Step-by-step guide for creating a sell listing with product details.",
    )

    # Journey flow
    t0 = await journey.initial_state.transition_to(
        chat_state='Say: "Hi, I can help you create a sell listing, what are you looking to sell today?"'
    )

    t1 = await t0.target.transition_to(
        tool_state=show_checklist
    )

    t2 = await t1.target.transition_to(
        chat_state="Ask what product they're selling (brand, model, year, specific details)"
    )

    t3 = await t2.target.transition_to(
        chat_state="Ask about the product's condition (new, like new, good, fair) and any defects or issues",
        condition="User told you the product"
    )

    t4 = await t3.target.transition_to(
        chat_state="Guide them to upload clear photos of their actual product using the form's upload feature. Remind them that actual product photos are important for sell listings.",
        condition="User described condition"
    )

    t5 = await t4.target.transition_to(
        chat_state="Ask what features the product has and what accessories/items are included"
    )

    t6 = await t5.target.transition_to(
        chat_state="Based on all the details gathered, suggest a title and ask if they'd like to use it or modify it.",
        condition="User shared all product details"
    )

    t7 = await t6.target.transition_to(
        tool_state=set_listing_title,
        condition="User approves the title"
    )

    t8 = await t7.target.transition_to(
        tool_state=show_checklist
    )

    t9 = await t8.target.transition_to(
        chat_state="Suggest a description highlighting the product's condition, features, and included items. Ask if they'd like any changes."
    )

    t10 = await t9.target.transition_to(
        tool_state=set_listing_description,
        condition="User approves the description"
    )

    t11 = await t10.target.transition_to(
        tool_state=show_checklist
    )

    t12 = await t11.target.transition_to(
        chat_state="Offer to generate relevant tags based on the product. Ask if they'd like that."
    )

    t13 = await t12.target.transition_to(
        tool_state=set_listing_tags,
        condition="User wants tags"
    )

    t14 = await t13.target.transition_to(
        tool_state=show_checklist
    )

    t15 = await t14.target.transition_to(
        chat_state="Perfect! All product details complete. They can now proceed to pricing and location."
    )

    await t15.target.transition_to(state=p.END_JOURNEY)

    # Guidelines for edge cases
    await journey.create_guideline(
        condition="User hasn't uploaded photos yet",
        action="Gently remind them that actual product photos are essential for sell listings and guide them to the upload feature",
    )

    await journey.create_guideline(
        condition="User describes product in detail",
        action="Be enthusiastic and help highlight the best features and selling points",
    )

    await journey.create_guideline(
        condition="User asks about price, location, or shipping",
        action="Explain you're only helping with product details - price, location, and shipping come in the next step.",
    )

    await agent.create_guideline(
        condition="User goes off-topic",
        action="Politely redirect to creating the listing",
    )

    return agent
