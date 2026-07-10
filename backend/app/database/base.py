from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """
    Shared Declarative Base class for all database models.
    All future SQLAlchemy models will inherit from this base class.
    
    This provides access to SQLAlchemy 2.0 type mapping capabilities.
    """
    pass
