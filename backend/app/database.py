import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

logger = logging.getLogger(__name__)

# Initialize the SQLAlchemy engine with settings optimized for serverless NeonDB
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"sslmode": "require"},
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base class for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency generator that yields a database session and guarantees closure in a finally block."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Initialize the database: enables pgvector extension and creates all model tables."""
    # Ensure all ORM models are registered with Base.metadata before creating tables
    import app.models  # noqa: F401

    logger.info("Initializing database extensions and tables...")
    try:
        with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            logger.info("Extension 'vector' checked/created successfully.")

        Base.metadata.create_all(bind=engine)
        logger.info("All database tables created or verified successfully.")
    except Exception as exc:
        logger.error(f"Database initialization failed: {exc}")
        raise

