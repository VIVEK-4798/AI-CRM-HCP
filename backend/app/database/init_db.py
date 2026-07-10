import logging
from sqlalchemy.exc import SQLAlchemyError
from app.database.base import Base
from app.database.database import engine
from app.models.hcp import HCP
from app.models.interaction import Interaction

# Configure simple logging for startup validation output
logger = logging.getLogger(__name__)

def init_db() -> None:
    """
    Initializes the database schema by building all tables inheriting from Base.
    Although no models are defined yet, this sets up the capability for future components.
    
    If the connection is not initialized, SQLAlchemy will attempt to verify/connect here.
    """
    try:
        logger.info("Initializing database tables...")
        # Create all tables in the database engine
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except SQLAlchemyError as e:
        logger.error(f"Critical error during database table initialization: {e}")
        # Re-raise the exception to prevent the application from starting in an unhealthy state
        raise e
