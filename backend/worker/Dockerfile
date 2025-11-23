# ============================================================================
# Dockerfile for Celery Worker (Background Task Processing)
# Based on the main backend Dockerfile but runs Celery instead of Uvicorn
# ============================================================================

# ============================================================================
# Stage 1: Builder - Install dependencies with uv
# ============================================================================
FROM python:3.12-slim as builder

# Install uv for fast dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Set working directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies into a virtual environment
RUN uv sync --frozen --no-dev --no-install-project

# ============================================================================
# Stage 2: Runtime - Minimal production image
# ============================================================================
FROM python:3.12-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH" \
    PORT=8080

# Install runtime dependencies only
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app && \
    chown -R appuser:appuser /app

# Set working directory
WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder --chown=appuser:appuser /app/.venv /app/.venv

# Copy application code
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Health check for Celery worker
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD /app/.venv/bin/celery -A src.celery_app inspect ping -d celery@$HOSTNAME || exit 1

# Run both health server (for Cloud Run health checks) and Celery worker
CMD ["sh", "-c", "/app/.venv/bin/uvicorn worker.health_server:app --host 0.0.0.0 --port ${PORT} --log-level warning & /app/.venv/bin/celery -A src.celery_app worker --loglevel=info --concurrency=2 --max-tasks-per-child=50"]
