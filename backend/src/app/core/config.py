from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from google.cloud import secretmanager


class Settings(BaseSettings):
    """Application settings with support for local .env and GCP Secret Manager."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Environment
    env: str = "development"
    debug: bool = True

    # Database
    postgres_user: str = "ngamje"
    postgres_password: str = "ngamje_dev_password"
    postgres_db: str = "ngamje_db"
    postgres_host: str = "localhost"
    postgres_port: int = 5432

    # Cloud SQL
    instance_connection_name: str | None = None

    # GCP
    gcp_project_id: str | None = None
    gcp_region: str = "us-central1"
    use_secret_manager: bool = False
    google_application_credentials: str | None = None

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_reload: bool = True

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:8000"

    # Security (Legacy - for old JWT auth, keeping for reference)
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # Clerk Authentication
    CLERK_PUBLISHABLE_KEY: str = ""
    CLERK_SECRET_KEY: str = ""
    CLERK_FRONTEND_API: str = ""  # e.g., https://your-app.clerk.accounts.dev

    # Didit KYC Verification
    DIDIT_API_KEY: str = ""
    DIDIT_WEBHOOK_SECRET: str = ""
    DIDIT_WORKFLOW_ID: str = ""  # Default KYC workflow ID
    DIDIT_BASE_URL: str = "https://verification.didit.me"
    DIDIT_CALLBACK_URL: str = ""  # Webhook callback URL (must be publicly accessible)

    # Cloudinary Image Storage
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # ============================================================================
    # TEMPORARY: KYC Bypass Mode for Development
    # TODO: Remove this section before production deployment
    # ============================================================================
    KYC_SKIP_VERIFICATION: bool = False  # Set to True to bypass real KYC calls
    # ============================================================================

    @property
    def database_url(self) -> str:
        """Construct database URL from components."""
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    def get_secret(self, secret_id: str, version: str = "latest") -> str:
        """
        Retrieve secret from GCP Secret Manager.

        Args:
            secret_id: The ID of the secret to retrieve
            version: The version of the secret (default: "latest")

        Returns:
            The secret value as a string

        Raises:
            ValueError: If GCP project ID is not configured
        """
        if not self.use_secret_manager:
            raise ValueError("Secret Manager is not enabled (USE_SECRET_MANAGER=false)")

        if not self.gcp_project_id:
            raise ValueError("GCP_PROJECT_ID must be set to use Secret Manager")

        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{self.gcp_project_id}/secrets/{secret_id}/versions/{version}"

        response = client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8")


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.

    This function is cached to avoid re-reading environment variables
    on every call. Use this instead of instantiating Settings directly.
    """
    return Settings()
