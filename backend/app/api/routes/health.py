"""
Health check API routes.
"""

from fastapi import APIRouter, status

from app.api.schemas import HealthResponse
from app.config import settings


router = APIRouter(prefix="/health", tags=["health"])


@router.get(
    "",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check",
    description="Check the health status of the API",
)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
        environment=settings.environment,
    )
