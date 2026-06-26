from pydantic import BaseModel, Field


class ScoreProductRequest(BaseModel):
    productContext: str


class GreenScoreResult(BaseModel):
    overallScore: int = Field(ge=0, le=100)
    environmentScore: int = Field(ge=0, le=100)
    socialScore: int = Field(ge=0, le=100)
    healthScore: int = Field(ge=0, le=100)
    reason: str
