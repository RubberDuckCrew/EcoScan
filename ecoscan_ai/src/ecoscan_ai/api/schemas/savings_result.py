from pydantic import BaseModel


class SavingsResult(BaseModel):
    co2Saving: float
    carRideEquivalent: int
