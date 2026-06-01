from fastapi import APIRouter, Request

import asyncio

from ecoscan_ai.api.schemas.green_score import ScoreProductRequest
from ecoscan_ai.api.schemas.green_score_result import GreenScoreResult
from ecoscan_ai.api.schemas.jobs import JobStatus, JobResponse
from ecoscan_ai.api.services.job_store import create_job, run_crew_background
from ecoscan_ai.crews.green_score.greenscore_crew import GreenScoreCrew

router = APIRouter(prefix="/score", tags=["GreenScore"])

_background_tasks: set[asyncio.Task] = set()


@router.post(
    "",
    status_code=202,
    operation_id="scoreProduct",
    response_model=JobResponse[GreenScoreResult],
)
async def score(request: Request, body: ScoreProductRequest) -> JobResponse:
    job_id, created_at = create_job()
    inputs = {"productContext": body.productContext}
    crew_instance = GreenScoreCrew().crew()
    task = asyncio.create_task(
        run_crew_background(job_id, crew_instance, inputs, endpoint=request.url.path)
    )
    _background_tasks.add(task)
    task.add_done_callback(_background_tasks.discard)
    return JobResponse(job_id=job_id, status=JobStatus.pending, created_at=created_at)
