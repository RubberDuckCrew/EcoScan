from pydantic import BaseModel


class GreenScoreResult(BaseModel):
    overall_score: int
