"""
Activate python in virtual environment folder first,
then run this in its own terminal to start up its MCP server.

Contains tool(s) to utilize SerpAPI web search functions.
"""

import os
import signal
import sys
import json
from dotenv import load_dotenv
# from mcp.server.fastmcp import FastMCP
from fastmcp import FastMCP
from langchain_community.utilities import SerpAPIWrapper

# Load environment variables from .env file
load_dotenv()

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

    # Convert results to JSON string if it's not already a string
    if isinstance(results, (dict, list)):
        return json.dumps(results, indent=2)
    return str(results)

def signal_handler(sig, frame):
    """Handle shutdown signals gracefully"""
    print("\nShutting down SerpAPI MCP server gracefully...")
    sys.exit(0)

if __name__ == "__main__":
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        mcp.run(transport="sse", port=8001, path="/sse")
    except KeyboardInterrupt:
        print("\nShutting down SerpAPI MCP server gracefully...")
        sys.exit(0)