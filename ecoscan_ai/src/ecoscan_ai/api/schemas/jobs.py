from typing import Generic, TypeVar

from pydantic import BaseModel, Field
from enum import Enum
from uuid import UUID

T = TypeVar("T")


class JobStatus(str, Enum):
    pending = "pending"
    running = "running"
    success = "success"
    failed = "failed"


class JobResponse(BaseModel, Generic[T]):
    job_id: UUID
    endpoint: str | None = None
    status: JobStatus
    created_at: str
    result: T | None = None
    error: str | None = None
    finished_at: str | None = None
