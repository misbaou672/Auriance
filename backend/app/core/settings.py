from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field("postgresql://postgres:110603@localhost:5432/postgres", env="DATABASE_URL")
    SECRET_KEY: str = Field("change_this_secret", env="SECRET_KEY")
    ALGORITHM: str = Field("HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(30, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    model_config = SettingsConfigDict(
        env_file=".env",  # charge les variables depuis .env
        extra="allow"
    )

settings = Settings()
