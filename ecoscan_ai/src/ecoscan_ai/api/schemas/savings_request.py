from pydantic import BaseModel


class SavingsRequest(BaseModel):
    savingsContext: str
