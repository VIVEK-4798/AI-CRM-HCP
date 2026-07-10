from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.session import get_db
from app.database.init_db import init_db
from app.api.hcp import router as hcp_router
from app.api.interaction import router as interaction_router
from app.api.ai import router as ai_router
from app.agents.router import router as agent_router

# Use modern lifespan context manager for application startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Perform database initialization and schema generation at startup
    init_db()
    yield

# Initialize FastAPI application with explicit Swagger UI configurations and lifespan
app = FastAPI(
    title="AI-First CRM HCP Module",
    description="Backend service for managing Healthcare Professionals (HCPs) with AI-powered insights using LangGraph and Groq.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable Cross-Origin Resource Sharing (CORS) for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production requirements
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(hcp_router)
app.include_router(interaction_router)
app.include_router(ai_router)
app.include_router(agent_router)

@app.get("/", tags=["Root"])
def read_root():
    """
    Root Endpoint
    Returns a running status message of the backend server.
    """
    return {"message": "Backend Running"}

@app.get("/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    """
    Health Check Endpoint.
    Verifies that the API service is active and checks database connection connectivity
    by executing a lightweight 'SELECT 1' query. Returns appropriate HTTP error if down.
    """
    try:
        # Execute raw SQL SELECT 1 to verify database responsiveness
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        # Database connection failed
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}"
        )
