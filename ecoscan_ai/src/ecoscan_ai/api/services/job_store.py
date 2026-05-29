import asyncio
import uuid
from datetime import datetime
from ecoscan_ai.api.schemas.jobs import JobStatus

jobs: dict[str, dict] = {}

def create_job() -> str:
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "status": JobStatus.pending,
        "created_at": datetime.now().isoformat(),
        "result": None,
        "error": None,
        "finished_at": None,
    }
    return job_id

async def run_crew_background(job_id: str, crew, inputs: dict):
    jobs[job_id]["status"] = JobStatus.running
    try:
        result = await asyncio.to_thread(crew.kickoff, inputs=inputs)
        jobs[job_id]["status"] = JobStatus.success
        jobs[job_id]["result"] = str(result)
    except Exception as e:
        import traceback
        jobs[job_id]["status"] = JobStatus.failed
        jobs[job_id]["error"] = str(e)
    finally:
        jobs[job_id]["finished_at"] = datetime.now().isoformat()