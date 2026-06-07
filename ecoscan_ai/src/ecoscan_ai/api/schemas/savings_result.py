from pydantic import BaseModel


class SavingsResult(BaseModel):
    co2_saving: int
    car_ride_equivalent: str
