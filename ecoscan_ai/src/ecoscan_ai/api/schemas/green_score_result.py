from pydantic import BaseModel


class GreenScoreResult(BaseModel):
    overall_score: int
    environmentScore: int
    socialScore: int
    healthScore: int
    reason: str
