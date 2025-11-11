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
    Generate a SELL listing description using AI based on the product context.

    Args:
        product_context: Context about the product (condition, features, accessories)

    Returns: Generated description for a sell listing
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{BACKEND_API_URL}/api/v1/generation/description",
                json={
                    "context": {"description": product_context},
                    "listing_type": "sell"  # Explicitly tell the API this is a SELL listing
                }
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

    Returns: Generated tags in structured format for preview
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

            return p.ToolResult(
                data={
                    "action": "show_tags_preview",
                    "tags": tags,
                },
                metadata={
                    "step": "tags",
                    "tag_count": len(tags),
                    "timestamp": datetime.now().isoformat()
                },
                canned_response_fields={
                    "tags": tags,
                    "tags_list": ", ".join(tags),
                    "tag_count": len(tags)
                }
            )
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
    """Search for product images on Unsplash and set them in the form."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BACKEND_API_URL}/api/v1/unsplash/search",
                params={"query": query, "per_page": per_page}
            )
            response.raise_for_status()
            data = response.json()
            image_urls = [img.get("url") for img in data.get("images", [])][:6]

            return p.ToolResult(
                data={
                    "action": "set_images",
                    "images": image_urls,
                },
                metadata={
                    "step": "images",
                    "image_count": len(image_urls),
                    "timestamp": datetime.now().isoformat()
                }
            )
    except Exception as e:
        return p.ToolResult(f"I had trouble searching for images: {str(e)}")


@p.tool
async def show_checklist(context: p.ToolContext) -> p.ToolResult:
    """Show the product details checklist UI."""
    return p.ToolResult(
        data={"action": "show_checklist", "items": ["title", "description", "images", "tags"]},
        metadata={"ui_action": "show_checklist", "timestamp": datetime.now().isoformat()}
    )


@p.tool
async def ask_approval(
    context: p.ToolContext,
    content_type: str,
    content: str,
    question: str = "Would you like to use this?"
) -> p.ToolResult:
    """
    Ask user to approve generated content with Y/n buttons.

    Args:
        content_type: Type of content being approved ("title", "description", "tags")
        content: The actual content to show/approve
        question: Optional custom question to ask (default: "Would you like to use this?")

    Returns: Structured approval request that triggers Y/n buttons in UI
    """
    return p.ToolResult(
        data={
            "action": "show_approval",
            "content_type": content_type,
            "content": content,
            "question": question
        },
        metadata={
            "ui_action": "approval_request",
            "timestamp": datetime.now().isoformat()
        }
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

    # Generate title
    t6 = await t5.target.transition_to(
        tool_state=generate_title,
        condition="User shared all product details"
    )

    # Show generated title and ask for approval via tool
    t6_approval = await t6.target.transition_to(
        chat_state="Call the ask_approval tool with content_type='title', content=<the generated title from the previous step>, and question='Would you like to use this title?'"
    )

    # Set title when approved
    t7 = await t6_approval.target.transition_to(
        tool_state=set_listing_title,
        condition="User approves (says yes, y, yep, sure, ok, or gives a quick affirmative)"
    )

    # Handle title rejection
    t6_reject = await t6_approval.target.transition_to(
        chat_state="Ask: 'What would you like to change about the title?'",
        condition="User rejects (says no, n, change, or provides specific feedback)"
    )

    # Regenerate title with feedback
    t6_regen = await t6_reject.target.transition_to(
        tool_state=generate_title,
        condition="User provided feedback"
    )

    # Loop back to approval
    await t6_regen.target.transition_to(state=t6_approval.target)

    t8 = await t7.target.transition_to(
        tool_state=show_checklist
    )

    # Generate description
    t9 = await t8.target.transition_to(
        tool_state=generate_description
    )

    # Show generated description and ask for approval via tool
    t9_approval = await t9.target.transition_to(
        chat_state="Call the ask_approval tool with content_type='description', content=<the generated description from the previous step>, and question='Would you like to use this description?'"
    )

    # Set description when approved
    t10 = await t9_approval.target.transition_to(
        tool_state=set_listing_description,
        condition="User approves (says yes, y, yep, sure, ok, or gives a quick affirmative)"
    )

    # Handle description rejection
    t9_reject = await t9_approval.target.transition_to(
        chat_state="Ask: 'What would you like to change about the description?'",
        condition="User rejects (says no, n, change, or provides specific feedback)"
    )

    # Regenerate description with feedback
    t9_regen = await t9_reject.target.transition_to(
        tool_state=generate_description,
        condition="User provided feedback"
    )

    # Loop back to approval
    await t9_regen.target.transition_to(state=t9_approval.target)

    t11 = await t10.target.transition_to(
        tool_state=show_checklist
    )

    t12 = await t11.target.transition_to(
        chat_state="Offer to generate relevant tags based on the product. Ask if they'd like that."
    )

    # Generate tags
    t13 = await t12.target.transition_to(
        tool_state=generate_tags,
        condition="User wants tags"
    )

    # Show generated tags and ask for approval via tool
    t14 = await t13.target.transition_to(
        chat_state="The tags are shown in the preview card above. Now call the ask_approval tool with content_type='tags', content=<comma-separated list of the generated tags>, and question='Would you like to use these tags?'"
    )

    # Set tags when approved
    t15 = await t14.target.transition_to(
        tool_state=set_listing_tags,
        condition="User approves (says yes, y, yep, sure, ok, or gives a quick affirmative)"
    )

    # Handle tags rejection
    t14_reject = await t14.target.transition_to(
        chat_state="Ask: 'What tags would you like instead?'",
        condition="User rejects (says no, n, or provides specific tag suggestions)"
    )

    # Regenerate tags with feedback
    t14_regen = await t14_reject.target.transition_to(
        tool_state=generate_tags,
        condition="User provided feedback"
    )

    # Loop back to approval
    await t14_regen.target.transition_to(state=t14.target)

    t16 = await t15.target.transition_to(
        tool_state=show_checklist
    )

    t17 = await t16.target.transition_to(
        chat_state="Perfect! All product details complete. They can now proceed to pricing and location."
    )

    await t17.target.transition_to(state=p.END_JOURNEY)

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

    await journey.create_guideline(
        condition="Images have been searched/set via search_product_images tool",
        action="DO NOT show or list the image URLs in your message. The images are displayed in a preview card automatically. Just acknowledge that you've added them and move forward.",
    )

    await journey.create_guideline(
        condition="Tags have been generated via generate_tags tool",
        action="DO NOT list out the tags in your message as text. The tags are shown in a preview card. Just ask if they want to use the generated tags.",
    )

    await journey.create_guideline(
        condition="Image search returned 0 results or failed",
        action="Acknowledge that no images were found and reassure them that they can upload their own actual product photos through the form. Remind them that real photos of their item are important for sell listings. Keep it friendly and move forward.",
    )

    # CRITICAL: Approval Tool Usage Guidelines
    await journey.create_guideline(
        condition="A title has just been generated via generate_title tool",
        action="You MUST immediately call the ask_approval tool with content_type='title', content=<the exact title that was generated>, and question='Would you like to use this title?'. DO NOT just ask in chat - you must use the ask_approval tool.",
        tools=[ask_approval],
    )

    await journey.create_guideline(
        condition="A description has just been generated via generate_description tool",
        action="You MUST immediately call the ask_approval tool with content_type='description', content=<the exact description that was generated>, and question='Would you like to use this description?'. DO NOT just ask in chat - you must use the ask_approval tool.",
        tools=[ask_approval],
    )

    await journey.create_guideline(
        condition="Tags have just been generated via generate_tags tool",
        action="You MUST immediately call the ask_approval tool with content_type='tags', content=<comma-separated list of all the tags>, and question='Would you like to use these tags?'. DO NOT just ask in chat - you must use the ask_approval tool.",
        tools=[ask_approval],
    )

    # Y/n Approval Response Guidelines
    await journey.create_guideline(
        condition="User responds with 'yes', 'y', 'yep', 'sure', 'ok', 'yeah', or similar affirmatives when asked for approval",
        action="Treat this as approval and proceed to set the content (title/description/tags) immediately.",
    )

    await journey.create_guideline(
        condition="User responds with 'no', 'n', 'nope', 'change', or provides specific feedback when asked for approval",
        action="Treat this as rejection. Ask what they'd like to change and collect their feedback to regenerate.",
    )

    await journey.create_guideline(
        condition="User gives an ambiguous response when asked for Y/n approval (neither clear yes nor clear no)",
        action="Politely ask for clarification: 'Would you like to use this, make changes, or skip for now?'",
    )

    await agent.create_guideline(
        condition="User goes off-topic",
        action="Politely redirect to creating the listing",
    )

    return agent
