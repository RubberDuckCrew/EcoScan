import asyncio
import logging
import uuid
from datetime import datetime

from ecoscan_ai.api.schemas.jobs import JobResponse, JobStatus

from ecoscan_ai.messaging.publisher import publish_job_result

jobs: dict[str, JobResponse] = {}

logger = logging.getLogger(__name__)


def track_background_task(
    task: asyncio.Task[None],
    task_set: set[asyncio.Task[None]],
) -> asyncio.Task[None]:
    task_set.add(task)
    task.add_done_callback(task_set.discard)
    return task


def create_job() -> tuple[str, str]:
async def cancel_background_tasks(task_set: set[asyncio.Task[None]]) -> None:
    if not task_set:
        return

    for task in list(task_set):
        task.cancel()

    await asyncio.gather(*task_set, return_exceptions=True)


def create_job() -> tuple[str, str]:
    job_id = str(uuid.uuid4())
    created_at = datetime.now().isoformat()
    job = JobResponse(
        job_id=job_id,
        status=JobStatus.pending,
        created_at=created_at,
    )
    jobs[job_id] = job
    return job_id, created_at


async def run_crew_background(job_id: str, crew, inputs: dict, endpoint: str):
    jobs[job_id].status = JobStatus.running
    jobs[job_id].endpoint = endpoint
    try:
        result = await crew.akickoff(inputs=inputs)
        jobs[job_id].status = JobStatus.success
        jobs[job_id].result = result.pydantic or result.raw
    except Exception as e:
        logger.exception("An error occurred during job %s execution", job_id)
        jobs[job_id].status = JobStatus.failed
        jobs[job_id].error = f"An error occurred during execution: {str(e)}"
    finally:
        jobs[job_id].finished_at = datetime.now().isoformat()
        try:
            published = await publish_job_result(jobs[job_id])
        except Exception:
            logger.exception("Unexpected error publishing job %s result", job_id)
        else:
            if not published:
                logger.warning(
                    "Job %s finished, but the completion notification could not be published",
                    job_id,
                )
