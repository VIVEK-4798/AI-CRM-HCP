import os
from pathlib import Path
from dotenv import load_dotenv

# Locate the root directory and find the .env file
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / ".env"

# Load the environment variables from the .env file if it exists
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    # If no .env is found, still try to load whatever is in system environment
    load_dotenv()

class Settings:
    """
    Application Settings Configurator.
    Loads and holds environment variables required for backend execution.
    """
    PROJECT_NAME: str = "AI-First CRM HCP Module"
    PROJECT_VERSION: str = "1.0.0"

    # Database Settings
    DATABASE_URL: str | None = os.getenv("DATABASE_URL")
    
    # AI/LLM Settings
    GROQ_API_KEY: str | None = os.getenv("GROQ_API_KEY")

    def validate_db_url(self) -> str:
        """
        Validates the presence of DATABASE_URL.
        Raises an EnvironmentError if DATABASE_URL is not configured.
        """
        if not self.DATABASE_URL:
            raise EnvironmentError(
                "CRITICAL SETUP ERROR: The 'DATABASE_URL' environment variable is not defined in the environment or .env file. "
                "Please configure DATABASE_URL (e.g., mysql+pymysql://user:pass@host:port/db) to start the server."
            )
        return self.DATABASE_URL

    def validate_groq_api_key(self) -> str:
        """
        Validates the presence of GROQ_API_KEY.
        Raises an EnvironmentError if GROQ_API_KEY is not configured.
        """
        if not self.GROQ_API_KEY or self.GROQ_API_KEY == "your-groq-api-key-here" or self.GROQ_API_KEY.strip() == "":
            raise EnvironmentError(
                "CRITICAL SETUP ERROR: The 'GROQ_API_KEY' environment variable is not defined or is placeholder in the environment or .env file. "
                "Please configure GROQ_API_KEY to start the AI services."
            )
        return self.GROQ_API_KEY

# Instantiate settings singleton for application use
settings = Settings()

