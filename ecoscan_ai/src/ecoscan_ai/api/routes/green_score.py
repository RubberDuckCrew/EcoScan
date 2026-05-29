from fastapi import APIRouter

import asyncio

from ecoscan_ai.api.schemas.green_score import CalculationPayload
from ecoscan_ai.api.schemas.jobs import JobStatus
from ecoscan_ai.api.services.job_store import create_job, run_crew_background
from ecoscan_ai.crews.green_score.greenscore_crew import GreenScoreCrew

router = APIRouter(prefix="/score", tags=["GreenScore"])

@router.post("", status_code=202)
async def test(body: CalculationPayload):
    job_id = create_job()
    inputs = {
        "productContext": body.productContext
    }
    asyncio.create_task(run_crew_background(job_id, GreenScoreCrew().crew(), inputs))
    return {"job_id": job_id, "status": JobStatus.pending}