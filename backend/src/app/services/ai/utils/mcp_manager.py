"""MCP client management utilities."""

import asyncio
from typing import List
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.tools import load_mcp_tools
from ..config import get_ai_settings


# Global MCP client and tools
_mcp_client: MultiServerMCPClient | None = None
_tools: List = []
_tools_lock = asyncio.Lock()


async def get_mcp_tools() -> List:
    """
    Get MCP tools, initializing client if needed.

    Returns:
        List of LangChain-compatible MCP tools
    """
    global _mcp_client, _tools

    async with _tools_lock:
        if _tools:
            return _tools

        settings = get_ai_settings()

        if not settings.mcp_enabled:
            return []

        if _mcp_client is None:
            _mcp_client = MultiServerMCPClient({
                "serpapi_search": {
                    "url": settings.mcp_serpapi_url,
                    "transport": settings.mcp_serpapi_transport,
                }
            })

        try:
            session = await _mcp_client.session("serpapi_search").__aenter__()
            serpapi_tools = await load_mcp_tools(session)
            _tools.extend(serpapi_tools)
            print(f"✅ Loaded {len(serpapi_tools)} tools from serpapi_search MCP server")
        except Exception as e:
            print(f"❌ Could not connect to serpapi_search server: {e}")

        return _tools
