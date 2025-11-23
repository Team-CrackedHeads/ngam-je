# ============================================================================
# Dockerfile for Celery Worker (Background Task Processing)
# Based on the main backend Dockerfile but runs Celery instead of Uvicorn
# ============================================================================

FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv for faster dependency management
RUN pip install --no-cache-dir uv

# Copy dependency files
COPY pyproject.toml .
COPY uv.lock .

# Install Python dependencies
RUN uv pip install --system -r pyproject.toml

# Copy application code
COPY . .

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Health check for Celery worker
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD celery -A src.celery_app inspect ping -d celery@$HOSTNAME || exit 1

# Run both health server (for Cloud Run health checks) and Celery worker
CMD ["/bin/bash", "-c", "uvicorn worker.health_server:app --host 0.0.0.0 --port ${PORT:-8080} --log-level warning & celery -A src.celery_app worker --loglevel=info --concurrency=2 --max-tasks-per-child=50"]
