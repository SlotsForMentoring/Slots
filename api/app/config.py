from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str
    app_jwt_secret: str
    database_url: str
    cors_origins: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()