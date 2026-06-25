from typing import Generic, TypeVar
from pydantic import UUID4, BaseModel, ConfigDict, Field, field_validator

T = TypeVar("T")


class AiDTO(BaseModel, Generic[T]):
    model_config = ConfigDict(populate_by_name=True)

    jobId: str = Field(..., description="UUID correlation ID")
    data: T = Field(..., description="Payload or result data")

    @field_validator("jobId")
    @classmethod
    def validate_job_id(cls, v: str) -> str:
        try:
            UUID4(v)
        except ValueError:
            from uuid import UUID

            UUID(v)
        return v
