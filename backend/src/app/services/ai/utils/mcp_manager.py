"""MCP client management utilities."""

import asyncio
from typing import List
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.tools import load_mcp_tools
from ..config import get_ai_settings


# Global MCP client and tools
_mcp_client: MultiServerMCPClient | None = None
_session_ctx = None
_mcp_session = None
_tools: List = []
_tools_lock = asyncio.Lock()


async def get_mcp_tools() -> List:
    """
    Get MCP tools, initializing client if needed.

    Returns:
        List of LangChain-compatible MCP tools
    """
    global _mcp_client, _session_ctx, _mcp_session, _tools

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
            # Store the context manager and enter it properly
            _session_ctx = _mcp_client.session("serpapi_search")
            _mcp_session = await _session_ctx.__aenter__()
            serpapi_tools = await load_mcp_tools(_mcp_session)
            _tools.extend(serpapi_tools)
            print(f"✅ Loaded {len(serpapi_tools)} tools from serpapi_search MCP server")
        except Exception as e:
            print(f"❌ Could not connect to serpapi_search server: {e}")
            if _session_ctx and _mcp_session:
                # Clean up on failure
                try:
                    await _session_ctx.__aexit__(None, None, None)
                except:
                    pass
                _session_ctx = None
                _mcp_session = None

        return _tools


async def cleanup_mcp():
    """
    Cleanup MCP resources. Should be called on application shutdown.
    """
    global _mcp_client, _session_ctx, _mcp_session

    if _session_ctx is not None and _mcp_session is not None:
        try:
            await _session_ctx.__aexit__(None, None, None)
        except Exception as e:
            print(f"Error cleaning up MCP session: {e}")
        finally:
            _session_ctx = None
            _mcp_session = None
            _mcp_client = None
