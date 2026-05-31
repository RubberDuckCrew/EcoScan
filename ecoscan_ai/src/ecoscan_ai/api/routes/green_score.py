from fastapi import APIRouter

import asyncio

from ecoscan_ai.api.schemas.green_score import ScoreProductRequest
from ecoscan_ai.api.schemas.jobs import JobStatus, JobResponse
from ecoscan_ai.api.services.job_store import create_job, run_crew_background
from ecoscan_ai.crews.green_score.greenscore_crew import GreenScoreCrew

router = APIRouter(prefix="/score", tags=["GreenScore"])

@router.post("", status_code=202, operation_id="scoreProduct", response_model=JobResponse)
async def score(body: ScoreProductRequest) -> JobResponse:
    job_id, created_at = create_job()
    inputs = {"productContext": body.productContext}
    asyncio.create_task(run_crew_background(job_id, GreenScoreCrew().crew, inputs))
    return JobResponse(job_id=job_id, status=JobStatus.pending, created_at=created_at)
