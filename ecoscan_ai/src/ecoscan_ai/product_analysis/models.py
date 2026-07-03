from pydantic import BaseModel


class ProductAnalysisRequest(BaseModel):
    productName: str
    productCategories: str
    productId: str


class ProductAnalysisResult(BaseModel):
    description: str
    data: str
