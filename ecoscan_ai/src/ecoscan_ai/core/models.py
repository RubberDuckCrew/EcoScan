from typing import Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

T = TypeVar("T")


class AiDTO(BaseModel, Generic[T]):
    model_config = ConfigDict(populate_by_name=True)

    jobId: str = Field(..., description="UUID correlation ID")
    userId: str = Field(..., description="UUID of the user")
    data: T = Field(..., description="Payload or result data")

    @field_validator("jobId")
    @classmethod
    def validate_job_id(cls, v: str) -> str:
        try:
            UUID(v)
        except (ValueError, AttributeError) as e:
            raise ValueError(f"Invalid UUID format: {e}")
        return v
