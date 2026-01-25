"""
Initialize and provide the search service singleton.
"""

from .tavily_search import TavilySearch

_service: TavilySearch | None = None


async def get_search_service() -> TavilySearch:
    global _service
    if _service is None:
        _service = TavilySearch()
    return _service


async def cleanup_search_service():
    global _service
    if _service:
        await _service.close()
        _service = None
