"""
Web search API routes.
"""

from typing import Annotated
from fastapi import APIRouter, Depends

from app.api.schemas import ErrorResponse, SearchRequest, SearchResponse
from app.api.logging import get_logger
from app.web_search import get_search_service, TavilySearch


logger = get_logger(__name__)

router = APIRouter(prefix="/search", tags=["search"])


@router.post(
    "",
    response_model=SearchResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Invalid API Key"},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
async def search(
    request: SearchRequest,
    service: Annotated[TavilySearch, Depends(get_search_service)],
):
    logger.info(f"Search request: {request.query}")
    return await service.search(request)
