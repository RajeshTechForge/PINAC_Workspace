"""API module."""

from fastapi import APIRouter
from .health import router as health_router
from .search import router as search_router
from .chat import router as chat_router


api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(search_router)
api_router.include_router(chat_router)

__all__ = ["api_router"]
