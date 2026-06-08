from pydantic import BaseModel


class SavingsResult(BaseModel):
    co2_saving: float
    car_ride_equivalent: int
