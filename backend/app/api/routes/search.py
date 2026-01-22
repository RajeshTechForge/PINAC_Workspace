"""
Web search API routes.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.schemas import ErrorResponse, SearchRequest
from app.api.logging import get_logger
from app.web_search import (
    InvalidQueryException,
    SearchResult,
    SearchTimeoutException,
    WebSearchService,
    get_search_service,
)

logger = get_logger(__name__)

router = APIRouter(prefix="/search", tags=["search"])


@router.post(
    "",
    response_model=SearchResult,
    status_code=status.HTTP_200_OK,
    summary="Perform web search",
    description="Search and crawl provided URLs to extract content for AI processing",
    responses={
        200: {
            "description": "Search completed successfully",
            "model": SearchResult,
        },
        400: {
            "description": "Invalid request",
            "model": ErrorResponse,
        },
        408: {
            "description": "Request timeout",
            "model": ErrorResponse,
        },
        500: {
            "description": "Internal server error",
            "model": ErrorResponse,
        },
    },
)
async def search(
    request: SearchRequest,
    search_service: Annotated[WebSearchService, Depends(get_search_service)],
) -> SearchResult:
    """
    Perform web search and content extraction.

    This endpoint crawls the provided URLs and extracts their content,
    making it suitable for AI processing and analysis.

    Args:
        request: Search request with query and URLs
        search_service: Injected web search service

    Returns:
        SearchResult: Search results with extracted content

    Raises:
        HTTPException: On various error conditions
    """
    try:
        logger.info(f"Received search request: query='{request.query}', urls={len(request.urls)}")

        result = await search_service.search(
            query=request.query,
            urls=request.urls,
            max_results=request.max_results,
        )

        return result

    except InvalidQueryException as e:
        logger.warning(f"Invalid query: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "InvalidQuery", "message": e.message, "details": e.details},
        )

    except SearchTimeoutException as e:
        logger.error(f"Search timeout: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail={"error": "SearchTimeout", "message": e.message, "details": e.details},
        )

    except Exception as e:
        logger.error(f"Unexpected error during search: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "InternalServerError",
                "message": "An unexpected error occurred during search",
                "details": {"error": str(e)},
            },
        )
