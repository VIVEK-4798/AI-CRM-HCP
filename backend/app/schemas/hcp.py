from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
import re

class HCPBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Full name of the HCP")
    specialization: str = Field(..., min_length=1, max_length=255, description="Medical specialization (e.g. Cardiology)")
    hospital: str = Field(..., min_length=1, max_length=255, description="Hospital or clinic affiliation")
    city: str = Field(..., min_length=1, max_length=100, description="City where HCP is located")
    email: str = Field(..., description="Unique email address")
    phone: str = Field(..., min_length=1, max_length=50, description="Phone contact number")

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, value: str) -> str:
        # Simple email validation pattern to avoid external email-validator package dependency
        email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not re.match(email_regex, value):
            raise ValueError("Invalid email format")
        return value.lower()

class HCPCreate(HCPBase):
    pass

class HCPUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    specialization: str | None = Field(None, min_length=1, max_length=255)
    hospital: str | None = Field(None, min_length=1, max_length=255)
    city: str | None = Field(None, min_length=1, max_length=100)
    email: str | None = Field(None)
    phone: str | None = Field(None, min_length=1, max_length=50)

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, value: str | None) -> str | None:
        if value is None:
            return value
        email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not re.match(email_regex, value):
            raise ValueError("Invalid email format")
        return value.lower()

class HCPResponse(HCPBase):
    id: int
    created_at: datetime
    updated_at: datetime

    # Pydantic v2 ORM compatibility configuration
    model_config = ConfigDict(from_attributes=True)
