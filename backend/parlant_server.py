# listing_agent.py

import parlant.sdk as p
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv(Path(__file__).parent / ".env")


@p.tool
async def get_listing_type_options(context: p.ToolContext) -> p.ToolResult:
    return p.ToolResult(["Buy", "Sell"])


async def add_domain_glossary(agent: p.Agent) -> None:
    await agent.create_term(
        name="Buy Listing",
        description="A listing where the user wants to purchase or find a product",
    )

    await agent.create_term(
        name="Sell Listing",
        description="A listing where the user wants to sell their own product",
    )


async def create_buy_listing_journey(server: p.Server, agent: p.Agent) -> p.Journey:
    # Create the journey
    journey = await agent.create_journey(
        title="Create Buy Listing",
        description="Helps the user create a buy listing by gathering product details.",
        conditions=["The user wants to create a buy listing"],
    )

    # First, determine what product they want
    t0 = await journey.initial_state.transition_to(chat_state="Ask what specific product they're looking to buy (brand, model, type)")

    # Ask about budget
    t1 = await t0.target.transition_to(
        chat_state="Ask about their budget range - minimum and maximum they're willing to spend"
    )

    # Ask about features
    t2 = await t1.target.transition_to(
        chat_state="Ask what specific features or specifications are important to them",
    )

    # Ask for images
    t3 = await t2.target.transition_to(
        chat_state="Ask them to upload, search, or generate reference images",
        condition="The user provides features",
    )

    # Ask about location
    t4 = await t3.target.transition_to(
        chat_state="Ask where they're located or willing to receive items from",
        condition="The user has provided or acknowledged images",
    )

    t5 = await t4.target.transition_to(chat_state="Confirm all details have been gathered")
    await t5.target.transition_to(state=p.END_JOURNEY)

    # Handle edge-cases deliberately with guidelines

    await journey.create_guideline(
        condition="The user is unsure about budget",
        action="Reassure them it's okay to give a rough estimate or range",
    )

    return journey


async def create_sell_listing_journey(server: p.Server, agent: p.Agent) -> p.Journey:
    # Create the journey
    journey = await agent.create_journey(
        title="Create Sell Listing",
        description="Helps the user create a sell listing by gathering product details.",
        conditions=["The user wants to create a sell listing"],
    )

    # Ask about product
    t0 = await journey.initial_state.transition_to(chat_state="Ask what product they're selling (brand, model, year, specific details)")

    # Ask about condition
    t1 = await t0.target.transition_to(
        chat_state="Ask about the product's condition (new, like new, good, fair) and if there are any defects",
    )

    # Ask about price
    t2 = await t1.target.transition_to(
        chat_state="Ask what price they'd like to sell for",
    )

    # Ask what's included
    t3 = await t2.target.transition_to(
        chat_state="Ask what features the product has and what's included with it",
    )

    # Ask for photos
    t4 = await t3.target.transition_to(
        chat_state="Ask them to upload actual photos of their product",
    )

    # Ask about location
    t5 = await t4.target.transition_to(
        chat_state="Ask where they're located for shipping/local pickup purposes",
    )

    t6 = await t5.target.transition_to(chat_state="Confirm all details have been gathered")
    await t6.target.transition_to(state=p.END_JOURNEY)

    # Handle edge cases with guidelines...

    await journey.create_guideline(
        condition="The user is unsure about pricing",
        action="Suggest they research similar items online to get an idea of market value",
    )

    return journey


async def main() -> None:
    async with p.Server(nlp_service=p.NLPServices.gemini) as server:
        agent = await server.create_agent(
            name="Listing Assistant",
            description="Is friendly and helpful in creating listings.",
        )

        await add_domain_glossary(agent)
        buy_journey = await create_buy_listing_journey(server, agent)
        sell_journey = await create_sell_listing_journey(server, agent)

        status_inquiry = await agent.create_observation(
            "The user wants to create a listing, but it's not clear if they want to buy or sell",
        )

        # Use this observation to disambiguate between the two journeys
        await status_inquiry.disambiguate([buy_journey, sell_journey])

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


if __name__ == "__main__":
    asyncio.run(main())
