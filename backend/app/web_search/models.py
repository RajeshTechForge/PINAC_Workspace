"""
Web search domain models and data structures.
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, HttpUrl


class SearchStatus(str, Enum):
    """Search operation status."""

    SUCCESS = "success"
    PARTIAL = "partial"
    FAILED = "failed"


class SearchResultItem(BaseModel):
    """
    Individual search result item.

    Attributes:
        title: Title of the web page
        url: URL of the web page
        description: Description or snippet from the page
        content: Extracted main content from the page
        meta_description: Meta description tag content
        meta_keywords: Meta keywords tag content
        links_count: Number of links found on the page
        images_count: Number of images found on the page
        crawl_timestamp: When this page was crawled
    """

    title: str = Field(..., description="Page title")
    url: HttpUrl = Field(..., description="Page URL")
    description: Optional[str] = Field(None, description="Page description or snippet")
    content: Optional[str] = Field(None, description="Extracted content from the page")
    meta_description: Optional[str] = Field(None, description="Meta description tag")
    meta_keywords: Optional[list[str]] = Field(None, description="Meta keywords")
    links_count: int = Field(default=0, description="Number of links on the page")
    images_count: int = Field(default=0, description="Number of images on the page")
    crawl_timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Crawl timestamp"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Example Website",
                "url": "https://example.com",
                "description": "This is an example website",
                "content": "Main content of the page...",
                "meta_description": "Example meta description",
                "meta_keywords": ["example", "website"],
                "links_count": 10,
                "images_count": 5,
                "crawl_timestamp": "2026-01-22T10:00:00Z",
            }
        }


class SearchResult(BaseModel):
    """
    Complete search operation result.

    Attributes:
        query: Original search query
        results: List of search result items
        total_results: Total number of results found
        status: Overall status of the search operation
        processing_time: Time taken to process the search in seconds
        errors: List of errors encountered during search
    """

    query: str = Field(..., description="Original search query")
    results: list[SearchResultItem] = Field(default_factory=list, description="Search results")
    total_results: int = Field(default=0, description="Total results count")
    status: SearchStatus = Field(default=SearchStatus.SUCCESS, description="Search status")
    processing_time: float = Field(default=0.0, description="Processing time in seconds")
    errors: list[str] = Field(default_factory=list, description="List of errors")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Search timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "query": "python fastapi",
                "results": [],
                "total_results": 0,
                "status": "success",
                "processing_time": 2.5,
                "errors": [],
                "timestamp": "2026-01-22T10:00:00Z",
            }
        }
