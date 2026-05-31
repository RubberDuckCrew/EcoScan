from pydantic import BaseModel


class TestPayload(BaseModel):
    topic: str
