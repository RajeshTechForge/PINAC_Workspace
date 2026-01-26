"""API schemas for all endpoints."""

from typing import Optional, Literal
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., description="Service status", examples=["healthy"])
    version: str = Field(..., description="API version", examples=["3.0.1"])
    environment: str = Field(..., description="Environment", examples=["development"])


class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error type", examples=["ValidationError"])
    error_msg: str = Field(..., description="Error message", examples=["Invalid input"])
    details: Optional[dict] = Field(
        None, description="Additional error details", examples=[{"field": "query"}]
    )


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Search query")
    api_key: str = Field(..., min_length=1, description="Tavily API Key")
    search_depth: str = Field(
        "basic",
        description="Search depth: basic or advanced",
        pattern="^(basic|advanced)$",
    )
    include_answer: bool = Field(False, description="Include a direct answer")


class SearchResult(BaseModel):
    title: str
    url: str
    content: str
    score: float


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResult]
    answer: Optional[str] = None
    context: str = Field(..., description="Markdown formatted context")


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    provider: Literal["openai", "gemini", "claude"] = Field(
        ..., description="LLM Provider"
    )
    model: str = Field(..., description="Model name for the provider")
    api_key: str = Field(..., description="API Key for the provider")
    history: list[ChatMessage] = Field(default_factory=list, description="Chat history")
    query: str = Field(..., description="User's current query")
    stream: bool = Field(False, description="Stream response")


class ChatResponse(BaseModel):
    response: str = Field(..., description="AI Response content")
