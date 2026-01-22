"""
Web crawler implementation using Crawl4AI.
"""

import asyncio
from datetime import datetime
from typing import Any, Optional
from crawl4ai import AsyncWebCrawler, BrowserConfig, CacheMode, CrawlerRunConfig

from app.api.logging import get_logger
from app.config import settings
from .exceptions import CrawlerException
from .models import SearchResultItem


logger = get_logger(__name__)


class WebCrawler:
    """
    Web crawler wrapper for Crawl4AI with production-grade error handling.

    Attributes:
        crawler: AsyncWebCrawler instance
        browser_config: Browser configuration
        crawler_config: Crawler run configuration
    """

    def __init__(self):
        """Initialize the web crawler with configured settings."""
        self.browser_config = BrowserConfig(
            headless=True,
            verbose=settings.crawl4ai_verbose,
        )

        self.crawler_config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            page_timeout=settings.web_search_timeout * 1000,  # Convert to milliseconds
            wait_until="networkidle",
        )

        self.crawler: Optional[AsyncWebCrawler] = None
        self._lock = asyncio.Lock()

    async def __aenter__(self):
        """Async context manager entry."""
        await self.initialize()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.cleanup()

    async def initialize(self) -> None:
        """
        Initialize the crawler instance.

        Raises:
            CrawlerException: If initialization fails
        """
        if self.crawler is not None:
            return

        async with self._lock:
            if self.crawler is not None:
                return

            try:
                logger.info("Initializing AsyncWebCrawler")
                self.crawler = AsyncWebCrawler(config=self.browser_config)
                await self.crawler.__aenter__()
                logger.info("AsyncWebCrawler initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize crawler: {e}")
                raise CrawlerException(
                    "Failed to initialize web crawler", details={"error": str(e)}
                )

    async def cleanup(self) -> None:
        """Clean up crawler resources."""
        if self.crawler is not None:
            try:
                logger.info("Cleaning up AsyncWebCrawler")
                await self.crawler.__aexit__(None, None, None)
                self.crawler = None
                logger.info("AsyncWebCrawler cleaned up successfully")
            except Exception as e:
                logger.error(f"Error during crawler cleanup: {e}")

    async def crawl_url(self, url: str) -> SearchResultItem:
        """
        Crawl a single URL and extract content.

        Args:
            url: URL to crawl

        Returns:
            SearchResultItem: Extracted content and metadata

        Raises:
            CrawlerException: If crawling fails
        """
        if self.crawler is None:
            await self.initialize()

        try:
            logger.info(f"Crawling URL: {url}")

            result = await self.crawler.arun(
                url=url,
                config=self.crawler_config,
            )

            if not result.success:
                error_msg = f"Failed to crawl {url}: {result.error_message}"
                logger.warning(error_msg)
                raise CrawlerException(error_msg, details={"url": url})

            # Extract metadata
            metadata = result.metadata or {}

            # Parse meta keywords if available
            meta_keywords = None
            if metadata.get("keywords"):
                meta_keywords = [kw.strip() for kw in metadata["keywords"].split(",") if kw.strip()]

            # Count links and images
            links_count = len(result.links.get("internal", [])) + len(
                result.links.get("external", [])
            )
            images_count = len(result.media.get("images", []))

            search_result = SearchResultItem(
                title=metadata.get("title", "No title"),
                url=url,
                description=metadata.get("description"),
                content=result.markdown[:5000] if result.markdown else None,  # Limit content
                meta_description=metadata.get("description"),
                meta_keywords=meta_keywords,
                links_count=links_count,
                images_count=images_count,
                crawl_timestamp=datetime.utcnow(),
            )

            logger.info(f"Successfully crawled {url}")
            return search_result

        except CrawlerException:
            raise
        except Exception as e:
            error_msg = f"Unexpected error crawling {url}: {str(e)}"
            logger.error(error_msg)
            raise CrawlerException(error_msg, details={"url": url, "error": str(e)})

    async def crawl_urls(self, urls: list[str]) -> list[SearchResultItem]:
        """
        Crawl multiple URLs concurrently with rate limiting.

        Args:
            urls: List of URLs to crawl

        Returns:
            list[SearchResultItem]: List of crawled results
        """
        if not urls:
            return []

        # Limit concurrent operations
        semaphore = asyncio.Semaphore(settings.crawl4ai_max_concurrent)

        async def crawl_with_semaphore(url: str) -> Optional[SearchResultItem]:
            async with semaphore:
                try:
                    return await self.crawl_url(url)
                except CrawlerException as e:
                    logger.warning(f"Failed to crawl {url}: {e.message}")
                    return None

        tasks = [crawl_with_semaphore(url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=False)

        # Filter out None results
        return [result for result in results if result is not None]
