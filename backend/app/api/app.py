"""
Main FastAPI application.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import api_router
from .logging import get_logger, setup_logging
from .middleware import RequestLoggingMiddleware

from app.config import settings
from app.web_search import cleanup_search_service, get_search_service


setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""

    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Environment: {settings.environment}")

    # Initialize services
    try:
        await get_search_service()
        logger.info("Services initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}", exc_info=True)
        raise

    yield

    # Shutdown
    logger.info("Shutting down application")
    await cleanup_search_service()
    logger.info("Services cleaned up")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="FastAPI server with web search capabilities using Crawl4AI",
    lifespan=lifespan,
    debug=settings.debug,
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup logging middleware
app.add_middleware(RequestLoggingMiddleware)

# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/", tags=["root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/api/health",
    }
