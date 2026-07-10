import logging

from pydantic import ValidationError

from ecoscan_ai.alternatives.crew import AlternativesCrew
from ecoscan_ai.alternatives.models import (
    AlternativesResult,
    AlternativesRequest,
)
from ecoscan_ai.core.base_worker import BaseWorker
from ecoscan_ai.core.models import AiDTO

logger = logging.getLogger(__name__)


class AlternativesWorker(BaseWorker):
    QUEUE_NAME = "ecoscan.ai.tasks.alternatives"
    RESULT_QUEUE = "ecoscan.ai.results.alternatives"
    FEATURE_NAME = "alternatives"

    def process(self, body: dict) -> AiDTO[AlternativesResult]:
        try:
            request = AiDTO[AlternativesRequest].model_validate(body)
        except ValidationError as exc:
            raise ValueError(f"Payload validation error: {exc}") from exc

        logger.info(
            "[%s] Processing started | jobId: %s | Context length: %d characters",
            self.FEATURE_NAME,
            request.jobId,
            len(request.data.categories),
        )

        # noinspection PyCallingNonCallable
        crew = AlternativesCrew()
        result = crew.product_crew().kickoff(
            inputs={"categories": request.data.categories}
        )

        final_data = AlternativesResult(
            eans=result.pydantic.eans if result.pydantic else [],
        )

        return AiDTO[AlternativesResult](
            jobId=request.jobId,
            data=final_data,
        )
