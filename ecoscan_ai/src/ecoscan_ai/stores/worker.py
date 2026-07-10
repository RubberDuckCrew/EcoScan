import logging

from pydantic import ValidationError

from ecoscan_ai.stores.crew import StoresCrew
from ecoscan_ai.stores.models import (
    AlternativesStoreResult,
    AlternativesStoreRequest,
)
from ecoscan_ai.core.base_worker import BaseWorker
from ecoscan_ai.core.models import AiDTO

logger = logging.getLogger(__name__)


class AlternativesStoreWorker(BaseWorker):
    QUEUE_NAME = "ecoscan.ai.tasks.alternatives.stores"
    RESULT_QUEUE = "ecoscan.ai.results.alternatives.stores"
    FEATURE_NAME = "alternative_stores"

    def process(self, body: dict) -> AiDTO[AlternativesStoreResult]:
        try:
            request = AiDTO[AlternativesStoreRequest].model_validate(body)
        except ValidationError as exc:
            raise ValueError(f"Payload validation error: {exc}") from exc

        logger.info(
            "[%s] Processing started | jobId: %s | Context length: %d characters",
            self.FEATURE_NAME,
            request.jobId,
            len(request.data.userCoordinates),
        )

        # noinspection PyCallingNonCallable
        crew = StoresCrew()
        result = crew.location_crew().kickoff(
            inputs={"user_coordinates": request.data.userCoordinates}
        )

        final_data = AlternativesStoreResult(
            stores=result.pydantic.stores if result.pydantic else []
        )

        return AiDTO[AlternativesStoreResult](
            jobId=request.jobId,
            data=final_data,
        )
