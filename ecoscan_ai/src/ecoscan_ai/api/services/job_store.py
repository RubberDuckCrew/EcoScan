import asyncio
import uuid
from datetime import datetime
from ecoscan_ai.api.schemas.jobs import JobStatus, JobResponse
import traceback

from ecoscan_ai.messaging.publisher import publish_job_result

jobs: dict[str, JobResponse] = {}


def create_job() -> tuple[str, str]:
    job_id = str(uuid.uuid4())
    created_at = datetime.now().isoformat()
    job = JobResponse(
        job_id=job_id,
        status=JobStatus.pending,
        created_at=datetime.now().isoformat(),
    )
    jobs[job_id] = job
    return job_id, created_at


async def run_crew_background(job_id: str, crew, inputs: dict):
    jobs[job_id].status = JobStatus.running
    try:
        result = await asyncio.to_thread(crew.kickoff, inputs=inputs)
        jobs[job_id].status = JobStatus.success
        jobs[job_id].result = result.pydantic or result.raw
    except Exception:
        jobs[job_id].status = JobStatus.failed
        jobs[job_id].error = traceback.format_exc()
    finally:
        jobs[job_id].finished_at = datetime.now().isoformat()
        await publish_job_result(jobs[job_id])
