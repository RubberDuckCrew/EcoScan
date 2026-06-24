import json
import logging

from pydantic import ValidationError

from ecoscan_ai.core.base_worker import BaseWorker
from ecoscan_ai.savings.crew import SavingsCrew
from ecoscan_ai.savings.models import SavingsRequest

logger = logging.getLogger(__name__)


class SavingsWorker(BaseWorker):
    QUEUE_NAME = "ecoscan.ai.tasks.savings"
    RESULT_QUEUE = "ecoscan.ai.results.savings"
    FEATURE_NAME = "savings"

    def process(self, body: bytes) -> str:
        try:
            raw = json.loads(body)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON: {exc}") from exc

        try:
            request = SavingsRequest.model_validate(raw)
        except ValidationError as exc:
            raise ValueError(f"Payload validation error: {exc}") from exc

        logger.info(
            "[%s] Processing started | jobId: %s | Context length: %d characters",
            self.FEATURE_NAME,
            request.jobId,
            len(request.savingsContext),
        )

        crew = SavingsCrew()
        result = crew.run(request)

        return result.model_dump_json()
