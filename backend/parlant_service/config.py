"""Configuration for Parlant service."""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from backend .env file
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Backend API URL for making requests to the main FastAPI app
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:8000")

# Parlant server settings
PARLANT_HOST = os.getenv("PARLANT_HOST", "localhost")
PARLANT_PORT = int(os.getenv("PARLANT_PORT", "8800"))

# Parlant data directory
PARLANT_DATA_DIR = Path(os.getenv("PARLANT_DATA_DIR", str(Path(__file__).parent.parent / "parlant-data")))

# Gemini API Key (required for Parlant NLP)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is required for Parlant service")
