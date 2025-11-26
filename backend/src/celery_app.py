"""Celery application for background tasks."""
from celery import Celery
import os

# Get Redis URL from environment
# For GCP Cloud Memorystore: redis://<MEMORYSTORE_IP>:6379/0
# For local development: redis://localhost:6379/0
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Create Celery app
celery_app = Celery(
    "ngam_je",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["src.app.services.matching.tasks"],  # Include task modules
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=600,  # 10 minutes max per task
    worker_prefetch_multiplier=1,  # Process one task at a time
    worker_max_tasks_per_child=50,  # Restart worker after 50 tasks
    broker_connection_retry_on_startup=True,  # Retry connecting to broker on startup
)
