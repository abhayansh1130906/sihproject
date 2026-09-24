from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):

    app_name: str = "SkillIntel API"
    app_version: str = "1.0.0"
    database_url: str
    secret_key: str
    groq_api_key: str
    demo_login_password: str

    @field_validator("database_url", mode="before")
    @classmethod
    def fix_database_url(cls, v: str) -> str:
        if isinstance(v, str):
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+psycopg://", 1)
            elif v.startswith("postgresql://") and "+psycopg" not in v:
                return v.replace("postgresql://", "postgresql+psycopg://", 1)
        return v

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()