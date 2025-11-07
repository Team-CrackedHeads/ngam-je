"""
Activate python in virtual environment folder first,
then run this in its own terminal to start up its MCP server.

Contains tool(s) to utilize SerpAPI web search functions.
"""

import os
# from mcp.server.fastmcp import FastMCP
from fastmcp import FastMCP
from langchain_community.utilities import SerpAPIWrapper

mcp = FastMCP(name="serpapi_search")

SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")

@mcp.tool
def serpapi_google_shopping_search(query: str) -> str:
    """
    Performs a Google Shopping search using SerpAPI for overall results of the query.
    """
    if not SERPAPI_API_KEY:
        return "Error: Missing SERPAPI_API_KEY"
    
    params = {
        "engine": "google_shopping",
        "hl": "en",
        "gl": "us",
        "serp_api_key": SERPAPI_API_KEY
    }

    search = SerpAPIWrapper(params=params)
    results = search.run(query)
    return results

if __name__ == "__main__":
    mcp.run(transport="sse", port=8001, path="/sse")