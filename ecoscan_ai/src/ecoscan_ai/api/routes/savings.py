import asyncio

from fastapi import APIRouter, Request

from ecoscan_ai.api.schemas.jobs import JobStatus, JobResponse
from ecoscan_ai.api.schemas.savings_request import SavingsRequest
from ecoscan_ai.api.schemas.savings_result import SavingsResult
from ecoscan_ai.api.services.job_store import create_job, run_crew_background
from ecoscan_ai.crews.savings.savings_crew import SavingsCrew

savings_router = APIRouter(prefix="/savings", tags=["Savings"])

_background_tasks: set[asyncio.Task] = set()


@savings_router.post(
    "",
    status_code=202,
    operation_id="savings",
    response_model=JobResponse[SavingsResult],
)
async def score(
        request: Request, body: SavingsRequest
) -> JobResponse[SavingsResult]:
    job_id, created_at = create_job()
    inputs = {"productContext": body.productContext}
    crew_instance = SavingsCrew().crew()
    task = asyncio.create_task(
        run_crew_background(job_id, crew_instance, inputs, endpoint=request.url.path)
    )
    _background_tasks.add(task)
    task.add_done_callback(_background_tasks.discard)
    return JobResponse(job_id=job_id, status=JobStatus.pending, created_at=created_at)
