"""
RAG Service - Gemini File Search integration for listing context
"""

import json
import asyncio
import tempfile
from pathlib import Path
from google import genai
from src.app.core.logging_config import get_logger
from src.models.listing import Listing

logger = get_logger("app.services.matching.rag")


def get_gemini_client():
    """Get Gemini client (reuse from generation service)"""
    return genai.Client()


def export_listing_to_json(listing: Listing) -> dict:
    """Export listing to JSON format for RAG"""
    return {
        "listing_id": listing.id,
        "title": listing.title,
        "description": listing.description,
        "listing_type": listing.listing_type,
        "price": listing.price,
        "min_price": listing.min_price,
        "max_price": listing.max_price,
        "currency": listing.currency,
        "tags": listing.tags or [],
        "creator_name": listing.creator_name,
        "creator_location": listing.creator_location,
        "shipping_options": listing.shipping_options or [],
        "inventory_quantity": listing.inventory_quantity,
        "created_at": listing.created_at.isoformat() if listing.created_at else None,
    }


async def create_match_store(wtb_listing: Listing, wts_listing: Listing) -> str:
    """
    Create Gemini File Search store for a listing pair

    Returns: store_name (e.g., "fileSearchStores/abc123")
    """
    client = get_gemini_client()

    try:
        # 1. Create File Search store
        logger.info(f"Creating File Search store for WTB {wtb_listing.id} <-> WTS {wts_listing.id}")
        store = client.file_search_stores.create(
            config={"display_name": f"match-{wtb_listing.id}-{wts_listing.id}"}
        )
        logger.info(f"Created store: {store.name}")

        # 2. Export listings to JSON
        wtb_data = export_listing_to_json(wtb_listing)
        wts_data = export_listing_to_json(wts_listing)

        # 3. Write to temporary files
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", delete=False
        ) as wtb_file:
            json.dump(wtb_data, wtb_file, indent=2)
            wtb_path = wtb_file.name

        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", delete=False
        ) as wts_file:
            json.dump(wts_data, wts_file, indent=2)
            wts_path = wts_file.name

        try:
            # 4. Upload WTB listing
            logger.info(f"Uploading WTB listing {wtb_listing.id}")
            op1 = client.file_search_stores.upload_to_file_search_store(
                file=wtb_path,
                file_search_store_name=store.name,
                config={
                    "display_name": f"WTB-{wtb_listing.id}",
                    "custom_metadata": [
                        {"key": "type", "string_value": "wtb"},
                        {"key": "listing_id", "numeric_value": float(wtb_listing.id)},
                    ],
                },
            )

            # 5. Upload WTS listing
            logger.info(f"Uploading WTS listing {wts_listing.id}")
            op2 = client.file_search_stores.upload_to_file_search_store(
                file=wts_path,
                file_search_store_name=store.name,
                config={
                    "display_name": f"WTS-{wts_listing.id}",
                    "custom_metadata": [
                        {"key": "type", "string_value": "wts"},
                        {"key": "listing_id", "numeric_value": float(wts_listing.id)},
                    ],
                },
            )

            # 6. Wait for indexing with async sleep
            logger.info("Waiting for file indexing...")
            max_wait = 30  # 30 second timeout
            elapsed = 0

            while not (op1.done and op2.done):
                if elapsed >= max_wait:
                    logger.warning("File indexing timeout - proceeding anyway")
                    break
                await asyncio.sleep(2)
                elapsed += 2

                try:
                    # Get operation name (handle both string and object)
                    op1_name = op1.name if hasattr(op1, 'name') else str(op1)
                    op2_name = op2.name if hasattr(op2, 'name') else str(op2)
                    op1 = client.operations.get(op1_name)
                    op2 = client.operations.get(op2_name)
                except Exception as e:
                    logger.warning(f"Error checking operation status: {e}, proceeding anyway")
                    break

            logger.info("Files indexed successfully")
            return store.name

        finally:
            # Cleanup temp files
            Path(wtb_path).unlink(missing_ok=True)
            Path(wts_path).unlink(missing_ok=True)

    except Exception as e:
        logger.error(f"Error creating File Search store: {e}")
        raise


async def cleanup_match_store(store_name: str):
    """Delete File Search store after negotiation (optional)"""
    client = get_gemini_client()

    try:
        logger.info(f"Deleting File Search store: {store_name}")
        client.file_search_stores.delete(name=store_name, config={"force": True})
        logger.info("Store deleted successfully")
    except Exception as e:
        logger.warning(f"Error deleting store (non-critical): {e}")
