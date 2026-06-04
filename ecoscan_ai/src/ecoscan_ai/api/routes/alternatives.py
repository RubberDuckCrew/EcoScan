from fastapi import APIRouter, Request

import asyncio

from ecoscan_ai.api.schemas.alternatives import AlternativesOutput
from ecoscan_ai.api.schemas.green_score import ScoreProductRequest
from ecoscan_ai.api.schemas.green_score_result import GreenScoreResult
from ecoscan_ai.api.schemas.jobs import JobStatus, JobResponse
from ecoscan_ai.api.services.job_store import create_job, run_crew_background
from ecoscan_ai.crews.alternatives.alternatives_crew import AlternativesCrew
from ecoscan_ai.crews.green_score.greenscore_crew import GreenScoreCrew

router = APIRouter(prefix="/alternatives", tags=["alternatives"])

_background_tasks: set[asyncio.Task] = set()


@router.get(
    "",
    status_code=202,
    operation_id="alternatives",
    response_model=JobResponse[AlternativesOutput],
)
async def alternatives(request: Request) -> JobResponse:
    job_id, created_at = create_job()
    inputs = {
        'product': 'Kinder Chocolate',
        'ean': '4008400200217',
        'user_coordinates': '48.137, 11.576',
    }
    crew_instance = AlternativesCrew().crew()
    task = asyncio.create_task(
        run_crew_background(job_id, crew_instance, inputs, endpoint=request.url.path)
    )
    _background_tasks.add(task)
    task.add_done_callback(_background_tasks.discard)
    return JobResponse(job_id=job_id, status=JobStatus.pending, created_at=created_at)
