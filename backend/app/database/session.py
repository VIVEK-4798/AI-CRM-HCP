from typing import Generator
from sqlalchemy.orm import sessionmaker, Session
from app.database.database import engine

# Configure session factory
# - autocommit=False: Ensures changes are committed explicitly via session.commit()
# - autoflush=False: Avoids flushing changes to the DB unless requested (helps control transaction boundaries)
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db() -> Generator[Session, None, None]:
    """
    Dependency injection generator to provide a database session per request.
    Automatically closes the session after response completion.
    
    Yields:
        Session: Active SQLAlchemy session database connection.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
