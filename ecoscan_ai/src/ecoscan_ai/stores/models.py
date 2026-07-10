from pydantic import BaseModel


class AlternativeCoordinates(BaseModel):
    name: str
    latitude: float
    longitude: float


class AlternativesStoreRequest(BaseModel):
    userCoordinates: str


class AlternativesStoreResult(BaseModel):
    stores: list[AlternativeCoordinates]
