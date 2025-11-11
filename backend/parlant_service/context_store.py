"""File-based store for session context data (shared across processes)."""

import json
import os
from pathlib import Path
from typing import Optional

# Use a file-based store so the FastAPI backend and Parlant server can share data
CONTEXT_FILE = Path(__file__).parent.parent / "parlant-data" / "session_contexts.json"


def _load_contexts() -> dict:
    """Load contexts from file."""
    if CONTEXT_FILE.exists():
        try:
            with open(CONTEXT_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {}
    return {}


def _save_contexts(contexts: dict) -> None:
    """Save contexts to file."""
    CONTEXT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(CONTEXT_FILE, 'w') as f:
        json.dump(contexts, f)


def set_listing_type(session_id: str, listing_type: str) -> None:
    """Store the listing type for a session."""
    contexts = _load_contexts()
    contexts[session_id] = listing_type
    _save_contexts(contexts)


def get_listing_type(session_id: str) -> Optional[str]:
    """Retrieve the listing type for a session."""
    contexts = _load_contexts()
    return contexts.get(session_id)


def clear_session(session_id: str) -> None:
    """Clear the context for a session."""
    contexts = _load_contexts()
    contexts.pop(session_id, None)
    _save_contexts(contexts)
