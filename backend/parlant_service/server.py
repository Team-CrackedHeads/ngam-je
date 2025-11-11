"""Parlant Server for Ngam-je Marketplace.

This server provides conversational AI assistance for creating listings
using the Parlant SDK with Gemini as the NLP service.
"""

import asyncio
import parlant.sdk as p

from .agents.buy_listing_agent import create_buy_listing_agent
from .agents.sell_listing_agent import create_sell_listing_agent


async def main() -> None:
    """Initialize and run the Parlant server."""
    async with p.Server(nlp_service=p.NLPServices.gemini) as server:
        # Create both specialized agents
        await create_buy_listing_agent(server)
        await create_sell_listing_agent(server)

        # Server will keep running until interrupted


if __name__ == "__main__":
    asyncio.run(main())
