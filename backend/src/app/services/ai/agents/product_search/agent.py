"""
Product Search Agent.

AI agent for searching and gathering product information using web search tools.
"""

from typing import Dict, Any, List
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from tenacity import AsyncRetrying, stop_after_attempt, wait_exponential
from pydantic import BaseModel
from cachetools import TTLCache

from src.app.core.logging_config import get_logger
from ...core.base import BaseAgent
from ...core.provider import get_llm
from ...utils.mcp_manager import get_mcp_tools
from ...utils.json_parser import clean_text_output, safe_parse_json
from .prompts import PRODUCT_DETAILS_PROMPT, PRODUCT_PRICES_PROMPT

logger = get_logger("app.services.ai.product_search")


class ProductDetailsResponse(BaseModel):
    """Product details response schema."""
    title: str
    description: str
    tags: List[str]
    images: List[str]


class ProductPricesResponse(BaseModel):
    """Product prices response schema."""
    price_history: List[float]
    max_price: float
    min_price: float
    avg_price: float


class ProductSearchAgent(BaseAgent):
    """
    Product search agent using LangChain and MCP tools.

    This agent can:
    - Search for product details
    - Gather product images
    - Analyze price history
    - Generate product descriptions and tags
    """

    # Class-level cache shared across all instances
    # TTL = 300 seconds (5 minutes), max 100 items
    _search_cache = TTLCache(maxsize=100, ttl=300)

    def __init__(self):
        """Initialize the product search agent."""
        self.llm = get_llm(temperature=0.0)
        self.tools = None  # Loaded lazily

    async def _ensure_tools_loaded(self):
        """Ensure MCP tools are loaded."""
        if self.tools is None:
            self.tools = await get_mcp_tools()

    def _get_cache_key(self, product_name: str, prompt_type: str) -> str:
        """
        Generate a cache key for the product search.

        Args:
            product_name: Name of the product
            prompt_type: Type of prompt (details or prices)

        Returns:
            Cache key string
        """
        # Normalize product name (lowercase, strip whitespace)
        normalized_name = product_name.strip().lower()
        return f"{prompt_type}:{normalized_name}"

    async def execute(self, input: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute agent with given input.

        Args:
            input: Dict with 'prompt' and 'query' keys

        Returns:
            Dict with 'output' key containing the response
        """
        await self._ensure_tools_loaded()

        prompt_template = ChatPromptTemplate.from_messages([
            ("system", "{given_prompt}"),
            ("human", "{query}"),
            MessagesPlaceholder("agent_scratchpad"),
        ])

        agent = create_tool_calling_agent(self.llm, self.tools, prompt_template)
        agent_executor = AgentExecutor(
            agent=agent,
            tools=self.tools,
            verbose=True,
            max_iterations=3,
        )

        text = ""
        async for attempt in AsyncRetrying(
            stop=stop_after_attempt(3),
            wait=wait_exponential(multiplier=1, min=4, max=10)
        ):
            with attempt:
                response = await agent_executor.ainvoke({
                    "query": input["query"],
                    "given_prompt": input["prompt"]
                })
                text = clean_text_output(response.get("output", ""))
                break

        return {"output": text}

    async def get_product_details(self, product_name: str) -> ProductDetailsResponse:
        """
        Get detailed information about a product.

        Args:
            product_name: Name of the product to search

        Returns:
            ProductDetailsResponse with title, description, tags, and images
        """
        cache_key = self._get_cache_key(product_name, "details")

        # Check cache first
        if cache_key in self._search_cache:
            logger.info(f"💾 Cache HIT - Product Details: '{product_name}'")
            cached_data = self._search_cache[cache_key]
            return ProductDetailsResponse(**cached_data)

        # Cache miss - execute search
        logger.info(f"🔍 Cache MISS - Fetching product details for: '{product_name}'")
        result = await self.execute({
            "prompt": PRODUCT_DETAILS_PROMPT,
            "query": product_name
        })

        parsed = safe_parse_json(result["output"])

        # Store in cache for future use
        self._search_cache[cache_key] = parsed
        logger.info(f"✅ Cached product details: '{parsed.get('title', product_name)}' (expires in 5min)")

        return ProductDetailsResponse(**parsed)

    async def get_product_prices(self, product_name: str) -> ProductPricesResponse:
        """
        Get price information and history for a product.

        Args:
            product_name: Name of the product to search

        Returns:
            ProductPricesResponse with price history and statistics
        """
        cache_key = self._get_cache_key(product_name, "prices")

        # Check cache first
        if cache_key in self._search_cache:
            logger.info(f"💾 Cache HIT - Product Prices: '{product_name}'")
            cached_data = self._search_cache[cache_key]
            return ProductPricesResponse(**cached_data)

        # Cache miss - execute search
        logger.info(f"🔍 Cache MISS - Fetching product prices for: '{product_name}'")
        result = await self.execute({
            "prompt": PRODUCT_PRICES_PROMPT,
            "query": product_name
        })

        parsed = safe_parse_json(result["output"])

        # Store in cache for future use
        self._search_cache[cache_key] = parsed
        price_range = f"${parsed.get('min_price', 0):.2f} - ${parsed.get('max_price', 0):.2f}"
        logger.info(f"✅ Cached product prices: {price_range} (expires in 5min)")

        return ProductPricesResponse(**parsed)
