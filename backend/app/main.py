import logging
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db, init_db
from app.routers.analytics import analytics_router
from app.routers.chat import chat_router
from app.routers.ingestion import ingestion_router
from app.schemas import HealthResponse

# Configure logging format and levels
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("omnirag.main")

# Initialize FastAPI application
app = FastAPI(
    title="OmniRAG Backend",
    version="1.0.0",
)

# Register routers
app.include_router(ingestion_router)
app.include_router(chat_router)
app.include_router(analytics_router)

# Configure CORS Middleware
origins = (
    settings.CORS_ORIGINS
    if isinstance(settings.CORS_ORIGINS, list)
    else [settings.CORS_ORIGINS]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """Startup lifecycle hook to initialize the database and ensure pgvector extension exists."""
    logger.info("Application starting up: initializing database connection and pgvector extension...")
    init_db()
    logger.info("Startup initialization complete.")


@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint: performs a SELECT 1 query to verify active database connectivity."""
    try:
        db.execute(text("SELECT 1"))
        return HealthResponse(status="ok", database="connected")
    except Exception as exc:
        logger.error(f"Database health check failed: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error: {str(exc)}",
        )
