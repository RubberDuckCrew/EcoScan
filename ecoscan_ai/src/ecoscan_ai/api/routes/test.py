import asyncio
from datetime import datetime
from fastapi import APIRouter, Request
from ecoscan_ai.api.schemas.test import TestPayload
from ecoscan_ai.api.schemas.jobs import JobStatus, JobResponse
from ecoscan_ai.api.services.job_store import (
    create_job,
    run_crew_background,
    track_background_task,
)
from ecoscan_ai.crews.crew import EcoscanAi

router = APIRouter(prefix="/test", tags=["Test"])


@router.post("", status_code=202, response_model=JobResponse[str])
async def test(body: TestPayload, request: Request) -> JobResponse:
    job_id, created_at = create_job()
    inputs = {"topic": body.topic, "current_year": str(datetime.now().year)}

    crew_instance = EcoscanAi().crew()

    background_task = asyncio.create_task(
        run_crew_background(job_id, crew_instance, inputs, request.url.path)
    )
    track_background_task(background_task, request.app.state.background_tasks)
    return JobResponse(
        job_id=job_id,
        status=JobStatus.pending,
        created_at=created_at,
    )
