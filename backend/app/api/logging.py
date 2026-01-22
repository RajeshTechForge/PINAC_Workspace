"""Logging configuration."""

import logging
import sys

from app.config import settings


def setup_logging() -> None:
    """Configure application logging."""
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    logging.basicConfig(
        level=getattr(logging, settings.log_level),
        format=log_format,
        handlers=[logging.StreamHandler(sys.stdout)],
    )

    # Set third-party library log levels
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("httpx").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance."""
    return logging.getLogger(name)
