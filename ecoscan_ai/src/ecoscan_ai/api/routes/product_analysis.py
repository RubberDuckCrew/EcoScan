from fastapi import APIRouter, Request
import asyncio

from ecoscan_ai.api.schemas.product_analysis import ProductAnalysisRequest, ProductAnalysisResult
from ecoscan_ai.api.schemas.jobs import JobStatus, JobResponse
from ecoscan_ai.api.services.job_store import create_job, run_crew_background
from ecoscan_ai.crews.product_analysis.product_analysis_crew import ProductAnalysisCrew

router = APIRouter(prefix="/product-analysis", tags=["ProductAnalysis"])

_background_tasks: set[asyncio.Task] = set()


@router.post(
    "",
    status_code=202,
    operation_id="analyzeProduct",
    response_model=JobResponse[ProductAnalysisResult],
)
async def analyze_product(request: Request, body: ProductAnalysisRequest) -> JobResponse[ProductAnalysisResult]:
    job_id, created_at = create_job()
    inputs = {
        "productName": body.productName,
        "productDescription": body.productDescription,
        "productId": body.productId,
    }
    crew_instance = ProductAnalysisCrew().crew()
    task = asyncio.create_task(
        run_crew_background(job_id, crew_instance, inputs, endpoint=request.url.path)
    )
    _background_tasks.add(task)
    task.add_done_callback(_background_tasks.discard)
    return JobResponse(job_id=job_id, status=JobStatus.pending, created_at=created_at)


