from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from app.core.config import settings

# Validate and retrieve the database URL before creating the engine
db_url = settings.validate_db_url()

# Create the SQLAlchemy engine with settings for production readiness
# - future=True: Opt-in to SQLAlchemy 2.0 behaviors (standard in 2.0+)
# - pool_pre_ping=True: Checks connection liveness before checking it out from pool (prevents stale connection errors)
# - echo=False: Avoid printing raw SQL statements in production logs (set to True during debug if needed)
engine: Engine = create_engine(
    db_url,
    pool_pre_ping=True,
    echo=False
)
