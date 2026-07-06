from pydantic import BaseModel


class AlternativeCoordinates(BaseModel):
    name: str
    latitude: float
    longitude: float

class AlternativesRequest(BaseModel):
    categories: str
    userCoordinates: str
    storeJobId: str | None = None

class AlternativesResult(BaseModel):
    eans: list[str]
    stores: list[AlternativeCoordinates]
    storeJobId: str | None = None