"""Request logging middleware."""

import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.api.logging import get_logger


logger = get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        logger.info(
            f"{request.method} {request.url.path} from {request.client.host if request.client else 'unknown'}"
        )
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(
            f"{request.method} {request.url.path} - {response.status_code} ({process_time:.3f}s)"
        )
        response.headers["X-Process-Time"] = str(process_time)
        return response
