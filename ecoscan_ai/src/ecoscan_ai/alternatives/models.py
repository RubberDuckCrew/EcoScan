from pydantic import BaseModel


class AlternativesRequest(BaseModel):
    categories: str
    userCoordinates: str

class AlternativeProduct(BaseModel):
    ean: str
    latitude: float
    longitude: float


class AlternativesResult(BaseModel):
    alternatives: list[AlternativeProduct]
