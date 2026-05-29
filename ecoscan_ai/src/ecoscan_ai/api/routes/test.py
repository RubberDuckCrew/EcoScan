import asyncio
from datetime import datetime
from fastapi import APIRouter
from ecoscan_ai.api.schemas.test import TestPayload
from ecoscan_ai.api.schemas.jobs import JobStatus
from ecoscan_ai.api.services.job_store import create_job, run_crew_background
from ecoscan_ai.crews.crew import EcoscanAi

router = APIRouter(prefix="/test", tags=["Test"])


@router.post("", status_code=202)
async def test(body: TestPayload):
    job_id = create_job()
    inputs = {
        "topic": body.topic,
        "current_year": str(datetime.now().year),
    }
    asyncio.create_task(run_crew_background(job_id, EcoscanAi().crew(), inputs))
    return {"job_id": job_id, "status": JobStatus.pending}
