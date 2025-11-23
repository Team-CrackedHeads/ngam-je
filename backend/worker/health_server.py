"""
Minimal HTTP health check server for Celery worker on Cloud Run.
Runs on port 8080 to satisfy Cloud Run health checks.
"""
import os
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"status": "healthy", "service": "celery-worker"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "celery-worker"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
