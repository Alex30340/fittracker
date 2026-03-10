from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://fittracker:fittracker_dev_2026@localhost:5432/fittracker"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # Auth
    secret_key: str = "dev-secret-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 30
    
    # Anthropic
    anthropic_api_key: str = ""
    
    # App
    environment: str = "development"
    app_name: str = "FitTracker API"
    app_version: str = "1.0.0"
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
