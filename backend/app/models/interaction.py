from datetime import datetime
from sqlalchemy import ForeignKey, String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.enums import InteractionMode, InteractionType, InteractionStatus

class Interaction(Base):
    """
    Interaction Model.
    Represents an interaction event log with a Healthcare Professional (HCP).
    """
    __tablename__ = "interactions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    hcp_id: Mapped[int] = mapped_column(ForeignKey("hcps.id", ondelete="CASCADE"), nullable=False)
    
    # Storing enums as strings in the database
    interaction_mode: Mapped[str] = mapped_column(String(50), nullable=False)
    interaction_type: Mapped[str] = mapped_column(String(50), nullable=False)
    
    interaction_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    products_discussed: Mapped[str] = mapped_column(Text, nullable=False)
    follow_up_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    # Many Interactions belong to One HCP
    hcp: Mapped["HCP"] = relationship("HCP", back_populates="interactions")
