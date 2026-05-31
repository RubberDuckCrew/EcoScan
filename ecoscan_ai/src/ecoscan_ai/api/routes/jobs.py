from ecoscan_ai.api.schemas.jobs import JobResponse
from ecoscan_ai.api.services.job_store import jobs
from fastapi import HTTPException, APIRouter

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job_id, **jobs[job_id]}


@router.get("", response_model=list[JobResponse])
def list_jobs():
    return [{"job_id": job_id, **job_info} for job_id, job_info in jobs.items()]
