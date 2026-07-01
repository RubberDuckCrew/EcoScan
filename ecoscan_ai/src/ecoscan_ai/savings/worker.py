import logging

from pydantic import ValidationError

from ecoscan_ai.core.base_worker import BaseWorker
from ecoscan_ai.core.models import AiDTO
from ecoscan_ai.savings.crew import SavingsCrew
from ecoscan_ai.savings.models import SavingsRequest, SavingsResult

logger = logging.getLogger(__name__)


class SavingsWorker(BaseWorker):
    QUEUE_NAME = "ecoscan.ai.tasks.savings"
    RESULT_QUEUE = "ecoscan.ai.results.savings"
    FEATURE_NAME = "savings"

    def process(self, body: dict) -> AiDTO[SavingsResult]:
        try:
            request = AiDTO[SavingsRequest].model_validate(body)
        except ValidationError as exc:
            raise ValueError(f"Payload validation error: {exc}") from exc

        logger.info(
            "[%s] Processing started | jobId: %s | Context length: %d characters",
            self.FEATURE_NAME,
            request.jobId,
            len(request.data.savingsContext),
        )

        # noinspection PyCallingNonCallable
        crew = SavingsCrew()
        result = crew.run(request.data)

        return AiDTO[SavingsResult](
            jobId=request.jobId,
            data=result,
        )
