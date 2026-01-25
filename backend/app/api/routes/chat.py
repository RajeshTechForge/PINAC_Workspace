"""
Chat API routes.
"""

from fastapi import APIRouter
from app.api.schemas import ErrorResponse, ChatRequest, ChatResponse
from app.api.logging import get_logger
from app.chat_service import ChatService

logger = get_logger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post(
    "",
    response_model=ChatResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Bad Request"},
        401: {"model": ErrorResponse, "description": "Invalid API Key"},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
async def chat(request: ChatRequest):
    logger.info(f"Chat request [{request.provider}/{request.model}]")
    service = ChatService()
    response_content = await service.generate_response(request)
    return ChatResponse(response=response_content)
