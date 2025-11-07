"""
Product Search Agent.

AI agent for searching and gathering product information using web search tools.
"""

from typing import Dict, Any, List
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from tenacity import AsyncRetrying, stop_after_attempt, wait_exponential
from pydantic import BaseModel

from ...core.base import BaseAgent
from ...core.provider import get_llm
from ...utils.mcp_manager import get_mcp_tools
from ...utils.json_parser import clean_text_output, safe_parse_json
from .prompts import PRODUCT_DETAILS_PROMPT, PRODUCT_PRICES_PROMPT


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

    def __init__(self):
        """Initialize the product search agent."""
        self.llm = get_llm(temperature=0.0)
        self.tools = None  # Loaded lazily

    async def _ensure_tools_loaded(self):
        """Ensure MCP tools are loaded."""
        if self.tools is None:
            self.tools = await get_mcp_tools()

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
        result = await self.execute({
            "prompt": PRODUCT_DETAILS_PROMPT,
            "query": product_name
        })

        parsed = safe_parse_json(result["output"])
        return ProductDetailsResponse(**parsed)

    async def get_product_prices(self, product_name: str) -> ProductPricesResponse:
        """
        Get price information and history for a product.

        Args:
            product_name: Name of the product to search

        Returns:
            ProductPricesResponse with price history and statistics
        """
        result = await self.execute({
            "prompt": PRODUCT_PRICES_PROMPT,
            "query": product_name
        })

        parsed = safe_parse_json(result["output"])
        return ProductPricesResponse(**parsed)
