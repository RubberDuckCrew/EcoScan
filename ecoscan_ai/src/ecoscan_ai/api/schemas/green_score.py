from pydantic import BaseModel


class ScoreProductRequest(BaseModel):
    productContext: str