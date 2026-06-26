from pydantic import BaseModel, Field


class SavingsRequest(BaseModel):
    savingsContext: str = Field(
        ..., description="Raw data block of the shopping history"
    )


class SavingsResult(BaseModel):
    co2Saving: float = Field(..., description="CO2 savings in kg")
    carRideEquivalent: int = Field(..., description="Equivalent number of car rides")
