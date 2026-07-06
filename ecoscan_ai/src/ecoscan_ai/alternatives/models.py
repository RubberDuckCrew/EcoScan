from pydantic import BaseModel, Field, AliasChoices

class AlternativeCoordinates(BaseModel):
    name: str
    latitude: float
    longitude: float

class AlternativesRequest(BaseModel):
    categories: str
    userCoordinates: str
    storeJobId: str | None = None

class AlternativesResult(BaseModel):
    eans: list[str] = Field(..., validation_alias=AliasChoices('eans', 'ean'))
    stores: list[AlternativeCoordinates]
    storeJobId: str | None = None