from pydantic import BaseModel

class StoreLocation(BaseModel):
    store_name: str
    latitude: float
    longitude: float


class AlternativeProduct(BaseModel):
    alternative_name: str
    alternative_ean: str
    location: StoreLocation


class AlternativesOutput(BaseModel):
    alternativ_products: list[AlternativeProduct]
