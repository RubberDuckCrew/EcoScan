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