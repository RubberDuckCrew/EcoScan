# noinspection PyPackageRequirements
from pydantic import UUID4, BaseModel, ConfigDict, Field, field_validator


class SavingsRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    jobId: str = Field(..., description="UUID correlation ID")
    savingsContext: str = Field(
        ..., description="Raw data block of the shopping history"
    )

    @field_validator("jobId")
    @classmethod
    def validate_job_id(cls, v: str) -> str:
        try:
            UUID4(v)
        except ValueError:
            from uuid import UUID

            UUID(v)
        return v


class SavingsResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    jobId: str = Field(..., description="Passed-through correlation ID")
    co2Saving: float = Field(..., description="CO2 savings in kg")
    carRideEquivalent: int = Field(..., description="Equivalent number of car rides")
