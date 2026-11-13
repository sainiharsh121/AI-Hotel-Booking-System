# backend/core/config.py
import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(os.path.join(basedir, ".env"))

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True)

    PROJECT_NAME: str = "Rajmahal Residency API"
    VERSION: str = "2.0.0"
    API_PREFIX: str = ""
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(basedir, 'hotel.db')}")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # AI & LLM settings (Isolated layer)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "gpt-4o-mini")
    AI_FALLBACK_ENABLED: bool = True
    
    # CORS
    CORS_ORIGINS: list[str] = ["*"]

settings = Settings()
