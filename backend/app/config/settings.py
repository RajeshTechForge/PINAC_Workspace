"""Application settings."""

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application Settings
    app_name: str = Field(default="Pinac Workspace Backend", description="Application name")
    app_version: str = Field(default="3.0.1", description="Application version")
    environment: Literal["development", "staging", "production"] = Field(
        default="development", description="Current environment"
    )
    debug: bool = Field(default=True, description="Debug mode")

    # API Settings
    host: str = Field(default="0.0.0.0", description="Server host")
    port: int = Field(default=8000, description="Server port")

    # CORS Settings
    allowed_origins: str = Field(
        default="http://localhost:3000,http://localhost:8000",
        description="Allowed CORS origins (comma-separated)",
    )

    # Logging Settings
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field(
        default="INFO", description="Logging level"
    )

    # Internal parsed values
    _allowed_origins_list: list[str] = []

    @field_validator("allowed_origins", mode="after")
    @classmethod
    def parse_cors_origins(cls, v: str) -> str:
        """Validate CORS origins string."""
        if not v or not v.strip():
            raise ValueError("allowed_origins cannot be empty")
        return v

    def model_post_init(self, __context) -> None:
        """Parse allowed_origins after model initialization."""
        self._allowed_origins_list = [
            origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()
        ]

    @property
    def cors_origins(self) -> list[str]:
        """Get parsed CORS origins as a list."""
        return self._allowed_origins_list

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
