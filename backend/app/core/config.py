"""
Centralized application configuration.

All environment-dependent values are read once here via pydantic-settings
and imported elsewhere as `from app.core.config import settings`.
Never read `os.environ` directly outside this module.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- App metadata ---
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "NeuroHire AI"
    API_V1_PREFIX: str = "/api/v1"

    # --- Database ---
    DATABASE_URL: str = "sqlite:///./neurohire.db"

    # --- Auth / JWT ---
    SECRET_KEY: str = "insecure-dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # --- CORS ---
    # Kept as a raw comma-separated string (not list[str]) because
    # pydantic-settings attempts to JSON-decode list-typed env vars before
    # any validator runs, which breaks a plain "http://a,http://b" value.
    # `cors_origins` below does the splitting instead.
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # --- ML Engine ---
    ML_ENGINE_URL: str = "http://127.0.0.1:8001"
    ML_ENGINE_TIMEOUT_SECONDS: int = 120

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """Cached settings accessor — safe to call repeatedly."""
    return Settings()


settings = get_settings()
