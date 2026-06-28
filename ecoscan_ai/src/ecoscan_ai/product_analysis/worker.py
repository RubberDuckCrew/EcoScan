import logging

from pydantic import ValidationError

from ecoscan_ai.core.base_worker import BaseWorker
from ecoscan_ai.core.models import AiDTO
from ecoscan_ai.product_analysis.crew import ProductAnalysisCrew
from ecoscan_ai.product_analysis.models import ProductAnalysisRequest, ProductAnalysisResult

logger = logging.getLogger(__name__)


class ProductAnalysisWorker(BaseWorker):
    QUEUE_NAME = "ecoscan.ai.tasks.product-analysis"
    RESULT_QUEUE = "ecoscan.ai.results.product-analysis"
    FEATURE_NAME = "product-analysis"

    def process(self, body: dict) -> AiDTO[ProductAnalysisResult]:
        try:
            request = AiDTO[ProductAnalysisRequest].model_validate(body)
        except ValidationError as exc:
            logger.error(
                "[%s] Payload validation error for body: %s | error: %s",
                self.FEATURE_NAME,
                body,
                exc,
            )
            raise ValueError(f"Payload validation error: {exc}") from exc

        logger.info(
            "[%s] Processing started | jobId: %s | Context length: %d characters",
            self.FEATURE_NAME,
            request.jobId,
            len(request.data.productName)
            +len(request.data.productDescription)
            +len(request.data.productId),
        )

        # noinspection PyCallingNonCallable
        crew = ProductAnalysisCrew()
        result = crew.run(request.data)

        return AiDTO[ProductAnalysisResult](
            jobId=request.jobId,
            data=result,
        )
