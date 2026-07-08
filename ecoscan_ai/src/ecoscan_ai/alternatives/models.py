from pydantic import BaseModel, Field, AliasChoices


class AlternativeCoordinates(BaseModel):
    name: str
    latitude: float
    longitude: float


class AlternativesRequest(BaseModel):
    categories: str


class AlternativesResult(BaseModel):
    eans: list[str] = Field(..., validation_alias=AliasChoices("eans", "ean"))


class AlternativesStoreRequest(BaseModel):
    userCoordinates: str


class AlternativesStoreResult(BaseModel):
    stores: list[AlternativeCoordinates]
