from fastapi import FastAPI
import sys

from app.api.v1.endpoints import auth, nodes, reservations, users
from app.core.config import settings

app = FastAPI(
    title="ServerSentinel API",
    description="Backend service for ServerSentinel, managing NPU server reservations.",
    version="0.1.0",
)

# Include all API routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(nodes.router, prefix="/api/v1/nodes", tags=["nodes"])
app.include_router(
    reservations.router, prefix="/api/v1/reservations", tags=["reservations"]
)


@app.get("/")
def read_root():
    """A simple endpoint to confirm the server is running."""
    return {"status": "ok", "message": "Welcome to ServerSentinel API!"}


@app.get("/health")
def health_check():
    """
    Health check endpoint for monitoring.
    符合 design.md 第 5.5.2 节的要求
    """
    return {
        "status": "healthy",
        "service": "ServerSentinel API",
        "version": "0.1.0",
        "database": "sqlite",
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    }


@app.on_event("startup")
def on_startup():
    # This is a good place to initialize DB, etc. if needed
    # For now, we rely on Alembic for DB setup.
    print("ServerSentinel API startup complete.")
    print(f"Python version: {sys.version}")

