from pydantic import BaseModel
from enum import Enum

class JobStatus(str, Enum):
    pending = "pending"
    running = "running"
    success = "success"
    failed = "failed"

class JobResponse(BaseModel):
    job_id: str
    status: JobStatus
    created_at: str
    result: str | None = None
    error: str | None = None
    finished_at: str | None = None