import logging

from pydantic import ValidationError

from ecoscan_ai.core.base_worker import BaseWorker
from ecoscan_ai.core.models import AiDTO
from ecoscan_ai.greenscore.crew import GreenScoreCrew
from ecoscan_ai.greenscore.models import GreenScoreResult, ScoreProductRequest

logger = logging.getLogger(__name__)


class GreenScoreWorker(BaseWorker):
    QUEUE_NAME = "ecoscan.ai.tasks.score"
    RESULT_QUEUE = "ecoscan.ai.results.score"
    FEATURE_NAME = "score"

    def process(self, body: dict) -> AiDTO[GreenScoreResult]:
        try:
            request = AiDTO[ScoreProductRequest].model_validate(body)
        except ValidationError as exc:
            raise ValueError(f"Payload validation error: {exc}") from exc

        logger.info(
            "[%s] Processing started | jobId: %s | Context length: %d characters",
            self.FEATURE_NAME,
            request.jobId,
            len(request.data.productContext),
        )

        # noinspection PyCallingNonCallable
        crew = GreenScoreCrew()
        result = crew.run(request.data)

        return AiDTO[GreenScoreResult](
            jobId=request.jobId,
            data=result,
        )
