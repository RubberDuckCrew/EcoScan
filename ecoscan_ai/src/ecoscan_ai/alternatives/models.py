from pydantic import BaseModel, Field, AliasChoices


class AlternativesRequest(BaseModel):
    categories: str


class AlternativesResult(BaseModel):
    eans: list[str] = Field(..., validation_alias=AliasChoices("eans", "ean"))
