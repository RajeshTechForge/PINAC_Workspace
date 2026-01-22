"""
Web search service exceptions.
"""


class WebSearchException(Exception):
    """Base exception for web search operations."""

    def __init__(self, message: str, details: dict | None = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class SearchTimeoutException(WebSearchException):
    """Raised when a search operation times out."""

    pass


class CrawlerException(WebSearchException):
    """Raised when crawler encounters an error."""

    pass


class InvalidQueryException(WebSearchException):
    """Raised when search query is invalid."""

    pass


class RateLimitException(WebSearchException):
    """Raised when rate limit is exceeded."""

    pass
