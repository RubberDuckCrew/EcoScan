from typing import Generic, TypeVar

from pydantic import BaseModel
from enum import Enum

T = TypeVar("T")


class JobStatus(str, Enum):
    pending = "pending"
    running = "running"
    success = "success"
    failed = "failed"


class JobResponse(BaseModel, Generic[T]):
    job_id: str
    endpoint: str | None = None
    status: JobStatus
    created_at: str
    result: T | None = None
    error: str | None = None
    finished_at: str | None = None
