from fastapi import FastAPI

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

@app.on_event("startup")
def on_startup():
    # This is a good place to initialize DB, etc. if needed
    # For now, we rely on Alembic for DB setup.
    print("ServerSentinel API startup complete.")
