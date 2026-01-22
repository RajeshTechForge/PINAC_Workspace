"""
Web search service implementation.
"""

import asyncio
import time
from typing import Optional

from app.api.logging import get_logger
from app.config import settings
from .crawler import WebCrawler
from .exceptions import InvalidQueryException, SearchTimeoutException
from .models import SearchResult, SearchStatus


logger = get_logger(__name__)


class WebSearchService:
    """
    Production-grade web search service using Crawl4AI.

    This service handles web search operations with proper error handling,
    timeout management, and result processing.
    """

    def __init__(self):
        """Initialize the web search service."""
        self.crawler = WebCrawler()
        self._initialized = False

    async def initialize(self) -> None:
        """Initialize the search service and underlying crawler."""
        if not self._initialized:
            await self.crawler.initialize()
            self._initialized = True
            logger.info("WebSearchService initialized")

    async def cleanup(self) -> None:
        """Clean up service resources."""
        if self._initialized:
            await self.crawler.cleanup()
            self._initialized = False
            logger.info("WebSearchService cleaned up")

    async def search(
        self, query: str, urls: list[str], max_results: Optional[int] = None
    ) -> SearchResult:
        """
        Perform a web search and crawl the provided URLs.

        Args:
            query: Search query for context
            urls: List of URLs to crawl and extract content from
            max_results: Maximum number of results to return (default from settings)

        Returns:
            SearchResult: Search results with extracted content

        Raises:
            InvalidQueryException: If query is invalid
            SearchTimeoutException: If search operation times out
        """
        start_time = time.time()

        # Validate input
        if not query or not query.strip():
            raise InvalidQueryException("Search query cannot be empty")

        if not urls:
            logger.warning(f"No URLs provided for query: {query}")
            return SearchResult(
                query=query,
                results=[],
                total_results=0,
                status=SearchStatus.SUCCESS,
                processing_time=0.0,
            )

        # Apply max results limit
        max_results = max_results or settings.web_search_max_results
        urls_to_crawl = urls[:max_results]

        logger.info(f"Starting search for query: '{query}' with {len(urls_to_crawl)} URLs")

        errors = []
        results = []

        try:
            # Ensure crawler is initialized
            if not self._initialized:
                await self.initialize()

            # Crawl URLs with timeout
            try:
                async with asyncio.timeout(settings.web_search_timeout):
                    results = await self.crawler.crawl_urls(urls_to_crawl)
            except asyncio.TimeoutError:
                error_msg = f"Search operation timed out after {settings.web_search_timeout}s"
                logger.error(error_msg)
                raise SearchTimeoutException(
                    error_msg,
                    details={"timeout": settings.web_search_timeout, "query": query},
                )

            # Determine status
            status = SearchStatus.SUCCESS
            if len(results) == 0:
                status = SearchStatus.FAILED
                errors.append("No results could be extracted from the provided URLs")
            elif len(results) < len(urls_to_crawl):
                status = SearchStatus.PARTIAL
                errors.append(f"Only {len(results)}/{len(urls_to_crawl)} URLs crawled successfully")

            processing_time = time.time() - start_time

            search_result = SearchResult(
                query=query,
                results=results,
                total_results=len(results),
                status=status,
                processing_time=round(processing_time, 2),
                errors=errors,
            )

            logger.info(
                f"Search completed: {len(results)} results in {processing_time:.2f}s "
                f"(status: {status})"
            )

            return search_result

        except (InvalidQueryException, SearchTimeoutException):
            raise
        except Exception as e:
            processing_time = time.time() - start_time
            error_msg = f"Unexpected error during search: {str(e)}"
            logger.error(error_msg, exc_info=True)

            return SearchResult(
                query=query,
                results=results,
                total_results=len(results),
                status=SearchStatus.FAILED,
                processing_time=round(processing_time, 2),
                errors=[error_msg],
            )


# Global service instance
_search_service: Optional[WebSearchService] = None


async def get_search_service() -> WebSearchService:
    """
    Get or create the global search service instance.

    Returns:
        WebSearchService: The global search service instance
    """
    global _search_service

    if _search_service is None:
        _search_service = WebSearchService()
        await _search_service.initialize()

    return _search_service


async def cleanup_search_service() -> None:
    """Clean up the global search service instance."""
    global _search_service

    if _search_service is not None:
        await _search_service.cleanup()
        _search_service = None
