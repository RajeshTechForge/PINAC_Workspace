"""API module."""

from fastapi import APIRouter
from .health import router as health_router
from .search import router as search_router


api_router = APIRouter()

# Include all routes
api_router.include_router(health_router)
api_router.include_router(search_router)

__all__ = ["api_router"]
