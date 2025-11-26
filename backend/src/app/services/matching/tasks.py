"""Celery tasks for AI matching and negotiation."""
import asyncio
from celery import Task
from src.celery_app import celery_app
from src.app.services.matching.matching_service import run_matching_for_listing


class AsyncTask(Task):
    """Base task class that runs async functions."""

    def __call__(self, *args, **kwargs):
        """Run async task in event loop."""
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(self.run(*args, **kwargs))


@celery_app.task(bind=True, base=AsyncTask, name="matching.run_for_listing")
async def run_matching_task(self, listing_id: int):
    """
    Run AI matching for a newly created listing.

    This task runs completely independently in a Celery worker process,
    ensuring it never blocks the web server.

    Args:
        listing_id: ID of the listing to match
    """
    await run_matching_for_listing(listing_id)
    return {"listing_id": listing_id, "status": "completed"}
