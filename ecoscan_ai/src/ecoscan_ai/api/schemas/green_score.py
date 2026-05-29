from pydantic import BaseModel


class CalculationPayload(BaseModel):
    productContext: str