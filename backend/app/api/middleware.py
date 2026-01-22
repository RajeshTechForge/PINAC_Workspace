"""Request logging middleware."""

import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.logging import get_logger


logger = get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging HTTP requests and responses."""

    async def dispatch(self, request: Request, call_next):
        """Process request and log details."""
        start_time = time.time()

        # Log request
        logger.info(
            f"{request.method} {request.url.path} from {request.client.host if request.client else 'unknown'}"
        )

        # Process request
        response = await call_next(request)

        # Calculate processing time
        process_time = time.time() - start_time

        # Log response
        logger.info(
            f"{request.method} {request.url.path} - {response.status_code} ({process_time:.3f}s)"
        )

        # Add processing time header
        response.headers["X-Process-Time"] = str(process_time)

        return response
