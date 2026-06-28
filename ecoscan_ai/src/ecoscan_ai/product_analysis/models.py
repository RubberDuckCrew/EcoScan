from pydantic import BaseModel


class ProductAnalysisRequest(BaseModel):
    productName: str
    productDescription: str
    productId: str


class ProductAnalysisResult(BaseModel):
    productId: str
    data: str