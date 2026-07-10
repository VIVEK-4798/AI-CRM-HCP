from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.models.enums import InteractionMode, InteractionType, InteractionStatus

class InteractionBase(BaseModel):
    hcp_id: int = Field(..., description="ID of the associated HCP")
    interaction_mode: InteractionMode = Field(..., description="Interaction mode (FORM or CHAT)")
    interaction_type: InteractionType = Field(..., description="Interaction type (IN_PERSON, CALL, EMAIL, or VIDEO)")
    interaction_date: datetime = Field(..., description="Timestamp of the interaction event")
    summary: str = Field(..., min_length=1, description="Text summary of discussion details")
    products_discussed: str = Field(..., min_length=1, description="Products discussed during the interaction")
    follow_up_date: datetime | None = Field(None, description="Optional follow-up date")
    status: InteractionStatus = Field(..., description="Status of interaction (COMPLETED, FOLLOW_UP_PENDING, or CANCELLED)")

class InteractionCreate(InteractionBase):
    pass

class InteractionUpdate(BaseModel):
    hcp_id: int | None = Field(None)
    interaction_mode: InteractionMode | None = Field(None)
    interaction_type: InteractionType | None = Field(None)
    interaction_date: datetime | None = Field(None)
    summary: str | None = Field(None, min_length=1)
    products_discussed: str | None = Field(None, min_length=1)
    follow_up_date: datetime | None = Field(None)
    status: InteractionStatus | None = Field(None)

class InteractionResponse(InteractionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    # Pydantic v2 ORM compatibility configuration
    model_config = ConfigDict(from_attributes=True)
