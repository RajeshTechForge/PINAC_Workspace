"""
Chat API routes.
"""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.api.schemas import ErrorResponse, ChatRequest, ChatResponse
from app.api.logging import get_logger
from app.chat_service import ChatService

logger = get_logger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post(
    "",
    response_model=ChatResponse | None,
    responses={
        400: {"model": ErrorResponse, "description": "Bad Request"},
        401: {"model": ErrorResponse, "description": "Invalid API Key"},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
async def chat(request: ChatRequest):
    logger.info(
        f"Chat request [{request.provider}/{request.model}] "
        f"stream={request.stream} history_len={len(request.history) if request.history else 0}"
    )

    service = ChatService()

    if request.stream:
        return StreamingResponse(
            service.generate_stream(request),
            media_type="text/plain; charset=utf-8",
            headers={
                "X-Accel-Buffering": "no",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )

    response_content = await service.generate_response(request)
    return ChatResponse(response=response_content)
