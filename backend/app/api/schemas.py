"""API schemas for all endpoints."""

from typing import Optional
from pydantic import BaseModel, Field, HttpUrl, field_validator


class SearchRequest(BaseModel):
    """
    Web search request schema.

    Attributes:
        query: Search query string
        urls: List of URLs to crawl and extract content from
        max_results: Maximum number of results to return (optional)
    """

    query: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Search query",
        examples=["python web scraping", "fastapi tutorial"],
    )
    urls: list[HttpUrl] = Field(
        ...,
        min_length=1,
        max_length=50,
        description="List of URLs to crawl",
        examples=[
            [
                "https://fastapi.tiangolo.com/",
                "https://docs.python.org/3/",
            ]
        ],
    )
    max_results: Optional[int] = Field(
        None,
        ge=1,
        le=50,
        description="Maximum number of results to return",
        examples=[10],
    )

    @field_validator("query")
    @classmethod
    def validate_query(cls, v: str) -> str:
        """Validate and clean the query string."""
        v = v.strip()
        if not v:
            raise ValueError("Query cannot be empty or only whitespace")
        return v

    @field_validator("urls")
    @classmethod
    def validate_urls(cls, v: list[HttpUrl]) -> list[str]:
        """Validate and convert URLs to strings."""
        if not v:
            raise ValueError("At least one URL must be provided")
        return [str(url) for url in v]


class HealthResponse(BaseModel):
    """
    Health check response schema.

    Attributes:
        status: Service status
        version: API version
        environment: Current environment
    """

    status: str = Field(..., description="Service status", examples=["healthy"])
    version: str = Field(..., description="API version", examples=["3.0.1"])
    environment: str = Field(..., description="Environment", examples=["development"])


class ErrorResponse(BaseModel):
    """
    Error response schema.

    Attributes:
        error: Error type
        message: Error message
        details: Additional error details
    """

    error: str = Field(..., description="Error type", examples=["ValidationError"])
    message: str = Field(..., description="Error message", examples=["Invalid input"])
    details: Optional[dict] = Field(
        None, description="Additional error details", examples=[{"field": "query"}]
    )
