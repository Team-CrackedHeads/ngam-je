"""Buy Listing Agent - Helps users create buy listings to find products."""

import parlant.sdk as p
import httpx
from typing import Optional
from datetime import datetime

from ..config import BACKEND_API_URL


@p.tool
async def set_listing_title(context: p.ToolContext, title: str) -> p.ToolResult:
    """
    Set the listing title in the form.

    Args:
        title: The title for the listing

    Returns: Confirmation with structured data for frontend
    """
    return p.ToolResult(
        data={
            "action": "set_title",
            "title": title.strip()
        },
        metadata={
            "step": "title",
            "timestamp": datetime.now().isoformat()
        },
        canned_response_fields={
            "title": title.strip()
        }
    )


@p.tool
async def get_product_information(context: p.ToolContext, product_name: str) -> p.ToolResult:
    """
    Search the web for product information to help user write better listing.

    Args:
        product_name: The product to search for

    Returns: Product specs, pros/cons, known issues, buying tips
    """
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{BACKEND_API_URL}/api/v1/generation/product-info",
                json={"product_name": product_name}
            )
            response.raise_for_status()
            data = response.json()
            info = data.get("info", "")

            if info:
                return p.ToolResult(
                    data={
                        "product_name": product_name,
                        "info": info,
                        "found": True
                    },
                    metadata={
                        "source": "web_search",
                        "product_searched": product_name
                    },
                    canned_response_fields={
                        "product_name": product_name,
                        "info": info
                    }
                )
            else:
                return p.ToolResult(
                    data={
                        "product_name": product_name,
                        "info": None,
                        "found": False
                    },
                    metadata={
                        "source": "web_search",
                        "product_searched": product_name
                    },
                    canned_response_fields={
                        "product_name": product_name
                    }
                )
    except Exception as e:
        return p.ToolResult(
            data={
                "error": str(e),
                "found": False
            },
            metadata={
                "error_type": type(e).__name__
            }
        )


@p.tool
async def generate_title(context: p.ToolContext, product_context: str) -> p.ToolResult:
    """
    Generate a listing title using AI based on the product context.

    Args:
        product_context: Context about the product (name, specs, user preferences)

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
    Generate a BUY listing description using AI based on the product context.

    Args:
        product_context: Context about the product and what user is looking for

    Returns: Generated description for a buy listing
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{BACKEND_API_URL}/api/v1/generation/description",
                json={
                    "context": {"description": product_context},
                    "listing_type": "buy"  # Explicitly tell the API this is a BUY listing
                }
            )
            response.raise_for_status()
            data = response.json()
            return p.ToolResult(f"Generated description: {data.get('description')}")
    except Exception as e:
        return p.ToolResult(f"Failed to generate description: {str(e)}")


@p.tool
async def set_listing_description(context: p.ToolContext, description: str) -> p.ToolResult:
    """Set the listing description in the form."""
    return p.ToolResult(
        data={
            "action": "set_description",
            "description": description
        },
        metadata={
            "step": "description",
            "timestamp": datetime.now().isoformat()
        },
        canned_response_fields={
            "description": description
        }
    )


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
async def set_listing_tags(context: p.ToolContext, tags: list[str]) -> p.ToolResult:
    """Set the listing tags in the form."""
    return p.ToolResult(
        data={
            "action": "set_tags",
            "tags": tags
        },
        metadata={
            "step": "tags",
            "tag_count": len(tags),
            "timestamp": datetime.now().isoformat()
        },
        canned_response_fields={
            "tags": tags,
            "tag_count": len(tags),
            "tags_list": ", ".join(tags)
        }
    )


@p.tool
async def show_checklist(context: p.ToolContext) -> p.ToolResult:
    """Show the product details checklist UI."""
    return p.ToolResult(
        data={
            "action": "show_checklist",
            "items": ["title", "description", "images", "tags"]
        },
        metadata={
            "ui_action": "show_checklist",
            "timestamp": datetime.now().isoformat()
        }
    )


@p.tool
async def show_product_research(context: p.ToolContext, product_name: str) -> p.ToolResult:
    """
    Display product research information in a nice UI card with markdown.

    Args:
        product_name: The product to show research for

    Returns: Structured product info for UI rendering
    """
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{BACKEND_API_URL}/api/v1/generation/product-info",
                json={"product_name": product_name}
            )
            response.raise_for_status()
            data = response.json()
            info = data.get("info", "")

            if info:
                return p.ToolResult(
                    data={
                        "action": "show_product_research",
                        "product_name": product_name,
                        "research": info,
                        "found": True
                    },
                    metadata={
                        "source": "web_search",
                        "ui_component": "product_research_card",
                        "timestamp": datetime.now().isoformat()
                    }
                )
            else:
                return p.ToolResult(
                    data={
                        "action": "show_product_research",
                        "product_name": product_name,
                        "research": None,
                        "found": False
                    },
                    metadata={
                        "source": "web_search",
                        "ui_component": "product_research_card"
                    }
                )
    except Exception as e:
        return p.ToolResult(
            data={
                "action": "show_product_research",
                "error": str(e),
                "found": False
            },
            metadata={
                "error_type": type(e).__name__
            }
        )


async def create_buy_listing_agent(server: p.Server) -> p.Agent:
    """Create the Buy Listing Agent with its journey."""
    agent = await server.create_agent(
        name="Buy Listing Assistant",
        description="Helps users create buy listings to find products they want to purchase.",
    )

    # ========== GLOSSARY TERMS - Domain-specific vocabulary ==========
    await agent.create_term(
        name="Buy Listing",
        description="A listing where the user wants to find and purchase a product from other sellers on the marketplace",
    )

    await agent.create_term(
        name="Sell Listing",
        description="A listing where the user is offering their own product for sale to potential buyers",
    )

    await agent.create_term(
        name="Condition",
        description="The physical state of a product: New (unopened/unused), Like New (minimal use, excellent condition), Good (normal wear, fully functional), Fair (visible wear but still works)",
    )

    await agent.create_term(
        name="Meetup",
        description="A face-to-face transaction where buyer and seller meet in person to exchange the product and payment at an agreed location",
    )

    await agent.create_term(
        name="COD",
        description="Cash on Delivery - a payment method where the buyer pays in cash when receiving the product, either during meetup or delivery",
    )

    await agent.create_term(
        name="Shipping",
        description="Delivery of the product from seller to buyer via postal service or courier, with costs typically paid by buyer",
    )

    await agent.create_term(
        name="Reference Images",
        description="Stock photos or product images from the internet used to illustrate what the product looks like in a buy listing, since the buyer doesn't own it yet",
    )

    # Product-specific terms
    await agent.create_term(
        name="RTX 4080",
        description="A high-end NVIDIA graphics card released in 2022 for gaming and AI workloads, featuring 16GB VRAM",
    )

    await agent.create_term(
        name="GPU",
        description="Graphics Processing Unit - a computer component responsible for rendering graphics and performing parallel computations",
    )

    await agent.create_term(
        name="RAM",
        description="Random Access Memory - computer memory used for temporary data storage while programs are running, measured in GB",
    )

    # ========== CONTEXT VARIABLES - Dynamic information ==========
    # Create variables (values will be set per session/customer)
    marketplace_var = await agent.create_variable(
        name="marketplace_name",
        description="The name of the marketplace platform"
    )

    # Set default value for all customers
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
        value="buy"
    )

    # ========== CANNED RESPONSES - Agent-level (always available) ==========
    greeting_response = await agent.create_canned_response(
        template="Hi! I'm here to help you create a buy listing on {{std.variables.marketplace_name}}. What product are you looking to buy?"
    )

    title_set_response = await agent.create_canned_response(
        template="Perfect! I've set your listing title to: \"{{title}}\""
    )

    description_set_response = await agent.create_canned_response(
        template="Great! I've added that description to your listing."
    )

    tags_set_response = await agent.create_canned_response(
        template="Awesome! I've added {{tag_count}} tags to help buyers find your listing: {{tags_list}}"
    )

    progress_check_response = await agent.create_canned_response(
        template="Let me show you where we are in the process..."
    )

    # Create the buy listing journey
    journey = await agent.create_journey(
        title="Create Buy Listing",
        conditions=["User wants to create a buy listing", "User is looking to purchase a product"],
        description="Guide users through creating a comprehensive buy listing by gathering product details, preferences, and requirements step by step.",
    )

    # ========== JOURNEY-SCOPED CANNED RESPONSES ==========
    product_research_response = await journey.create_canned_response(
        template="Let me research {{product_name}} for you...",
        signals=["Let me look that up", "I'll search for information"]
    )

    title_suggestion_response = await journey.create_canned_response(
        template="How about this for your listing title: \"WTB: {{generative.product_name}} - Looking to Buy\"? Would you like to use this or adjust it?"
    )

    images_choice_response = await journey.create_canned_response(
        template="For images, you can either upload your own reference images or I can search for product photos online. Which would you prefer?"
    )

    completion_response = await journey.create_canned_response(
        template="Fantastic! You've completed all the product details. Next, you'll need to add pricing and location information."
    )

    # Journey flow - following conversation logic, not task automation
    t0 = await journey.initial_state.transition_to(
        chat_state="Greet warmly and ask what product they're looking to buy",
        canned_responses=[greeting_response]
    )

    # Check if product has variants (e.g., PS5 has Slim, Pro, Digital)
    t1 = await t0.target.transition_to(
        chat_state="If the product has multiple variants/models (like PS5 has Slim/Pro/Digital), ask which specific one they want. If it's a simple product with no variants, move forward.",
        condition="User mentions a product"
    )

    # Generate title once product is clear
    t2 = await t1.target.transition_to(
        tool_state=generate_title,
        condition="Product and variant are clear"
    )

    # Show generated title and ask for approval
    t3 = await t2.target.transition_to(
        chat_state="Present the generated title and ask if they'd like to use it or adjust it."
    )

    # Set title when approved
    t4 = await t3.target.transition_to(
        tool_state=set_listing_title,
        condition="User approves the title"
    )

    # Show checklist
    t5 = await t4.target.transition_to(
        tool_state=show_checklist
    )

    # Tell user they need a description next and ASK if they want helpful research
    t6 = await t5.target.transition_to(
        chat_state="Tell them the next step is the description. Offer to show them some helpful product research to make it easier. Ask in a friendly way: 'Would you like me to show you some helpful info about this product first? It might make writing your description easier!'"
    )

    # Show product research card as helper
    t7 = await t6.target.transition_to(
        tool_state=show_product_research
    )

    # Ask for their short description
    t8 = await t7.target.transition_to(
        chat_state="Great! Now, please type a brief description of what you're looking for - what condition? any specific features you need? Keep it short and simple."
    )

    # Generate full description from their input
    t9 = await t8.target.transition_to(
        tool_state=generate_description,
        condition="User provided their short description"
    )

    # Show generated description in chat and ask for approval
    t10 = await t9.target.transition_to(
        chat_state="Present the generated description in your message. Ask if they want to use it or make changes."
    )

    # Set description when approved
    t11 = await t10.target.transition_to(
        tool_state=set_listing_description,
        condition="User approves"
    )

    # Show checklist
    t12 = await t11.target.transition_to(
        tool_state=show_checklist
    )

    # Handle images - branch based on user preference
    t13 = await t12.target.transition_to(
        chat_state="Explain that they can either upload their own reference images or you can search for product images to illustrate their listing. Ask which they prefer.",
        canned_responses=[images_choice_response]
    )

    # Branch: Search for images
    t14 = await t13.target.transition_to(
        tool_state=search_product_images,
        condition="User wants help finding reference images"
    )

    # After images are set, just move to checklist (no need to show URLs)
    t15 = await t14.target.transition_to(
        tool_state=show_checklist
    )

    # Branch: User will upload or skip
    t16 = await t13.target.transition_to(
        chat_state="Acknowledge their choice and let them know they can add images through the form whenever ready",
        condition="User prefers to handle images themselves or skip for now"
    )

    t17 = await t16.target.transition_to(
        tool_state=show_checklist
    )

    # Merge branches back to tags
    t18 = await t15.target.transition_to(
        chat_state="Offer to generate relevant tags to help their listing get discovered. Ask if they'd like that."
    )

    await t17.target.transition_to(state=t18.target)

    # Generate tags
    t19 = await t18.target.transition_to(
        tool_state=generate_tags,
        condition="User wants tags"
    )

    # Ask for approval (tags are already shown in preview card)
    t20 = await t19.target.transition_to(
        chat_state="Ask if they want to use the generated tags shown above."
    )

    # Set tags when approved
    t21 = await t20.target.transition_to(
        tool_state=set_listing_tags,
        condition="User approves the tags"
    )

    t22 = await t21.target.transition_to(
        tool_state=show_checklist
    )

    # Journey completion
    t23 = await t22.target.transition_to(
        chat_state="Congratulate them on completing the product details. Let them know the next steps are pricing and location.",
        canned_responses=[completion_response]
    )

    await t23.target.transition_to(state=p.END_JOURNEY)

    # Journey-scoped guidelines for handling digressions
    await journey.create_guideline(
        condition="Product research has been shown via the show_product_research tool",
        action="DO NOT repeat or summarize the research information in your chat messages. The user can see it in the research card. Just acknowledge it briefly and move forward with the next question.",
    )

    await journey.create_guideline(
        condition="User provides unclear, vague, or nonsensical input that makes it impossible to proceed",
        action="Politely acknowledge their input and ask them to clarify or provide more specific information so you can help them effectively",
    )

    await journey.create_guideline(
        condition="User asks about pricing, budget constraints, payment methods, or how much they should offer",
        action="Acknowledge their question and explain that you're currently focused on product details. Reassure them that pricing will be covered in the next step of the listing process.",
    )

    await journey.create_guideline(
        condition="User asks about location, shipping, delivery, or meetup arrangements",
        action="Acknowledge their concern and explain that location and shipping details will be handled in the next step after product details are complete.",
    )

    await journey.create_guideline(
        condition="User wants to skip a step or come back to it later",
        action="Be accommodating and flexible. Allow them to skip the current step and move forward, reminding them they can always update details later through the form.",
    )

    await journey.create_guideline(
        condition="Images have been searched/set via search_product_images tool",
        action="DO NOT show or list the image URLs in your message. The images are displayed in the form automatically. Just acknowledge that you've added them and move forward.",
    )

    await journey.create_guideline(
        condition="Tags have been generated via generate_tags tool",
        action="DO NOT list out the tags in your message as text. The tags are shown in a preview component. Just ask if they want to use the generated tags.",
    )

    await journey.create_guideline(
        condition="Image search returned 0 results or failed",
        action="Acknowledge that no images were found and reassure them that they can upload their own photos later through the form, or skip images for now. Keep it friendly and move forward.",
    )

    # Agent-level guidelines (active across all contexts)
    await agent.create_guideline(
        condition="User goes completely off-topic or asks questions unrelated to creating a buy listing",
        action="Politely acknowledge their comment and gently redirect the conversation back to creating their buy listing",
    )

    await agent.create_guideline(
        condition="User expresses frustration, confusion, or difficulty with the process",
        action="Express empathy and understanding. Offer to slow down, skip steps, or simplify the process to make it easier for them.",
        tools=[show_checklist],
    )

    await agent.create_guideline(
        condition="User asks what information is still needed or what's left to complete",
        action="Show them the progress checklist to give them a clear visual of what's done and what remains",
        tools=[show_checklist],
    )

    return agent
