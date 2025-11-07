"""Base classes for AI agents and tools."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List


class BaseAgent(ABC):
    """Base class for all AI agents."""

    @abstractmethod
    async def execute(self, input: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute agent with given input.

        Args:
            input: Input data for the agent

        Returns:
            Dict containing agent response and metadata
        """
        pass

    def get_tools(self) -> List['BaseTool']:
        """Get agent's available tools."""
        return []


class BaseTool(ABC):
    """Base class for all AI tools."""

    @abstractmethod
    async def run(self, *args, **kwargs) -> Any:
        """Run the tool."""
        pass
