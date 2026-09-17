from pydantic_settings import BaseSettings

class Settings(BaseSettings):

    app_name: str = "SkillIntel API"
    app_version: str = "1.0.0"
    database_url: str
    secret_key: str

    class Config:
        env_file = ".env"

settings = Settings()