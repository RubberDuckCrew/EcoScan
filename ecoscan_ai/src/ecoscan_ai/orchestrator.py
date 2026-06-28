import logging
import signal
import threading
from concurrent.futures import Future, ThreadPoolExecutor
from typing import TYPE_CHECKING

from ecoscan_ai.product_analysis.worker import ProductAnalysisWorker
from ecoscan_ai.greenscore.worker import GreenScoreWorker
from ecoscan_ai.savings.worker import SavingsWorker

if TYPE_CHECKING:
    from ecoscan_ai.core.base_worker import BaseWorker

logger = logging.getLogger(__name__)

WORKER_CLASSES: list[type["BaseWorker"]] = [
    ProductAnalysisWorker,
    GreenScoreWorker,
    SavingsWorker,
]


class Orchestrator:
    def __init__(self) -> None:
        self._workers: list["BaseWorker"] = [cls() for cls in WORKER_CLASSES]
        self._executor: ThreadPoolExecutor | None = None
        self._shutdown_event = threading.Event()
        self._futures: list[tuple[Future, "BaseWorker"]] = []

    def start(self) -> None:
        self._register_signal_handlers()

        self._executor = ThreadPoolExecutor(
            max_workers=len(self._workers),
            thread_name_prefix="ecoscan-worker",
        )

        for worker in self._workers:
            future = self._executor.submit(worker.run)  # type: ignore
            self._futures.append((future, worker))

            future.add_done_callback(lambda f, w=worker: self._on_worker_done(f, w))

            logger.info(
                "[orchestrator] Worker started | Feature: %s | Queue: %s",
                worker.FEATURE_NAME,
                worker.QUEUE_NAME,
            )

        logger.info(
            "[orchestrator] All %d worker threads active. Waiting for SIGTERM/SIGINT ...",
            len(self._workers),
        )

        self._shutdown_event.wait()
        self._graceful_shutdown()

    def _on_worker_done(self, future: Future, worker: "BaseWorker") -> None:
        try:
            future.result()
        except Exception as exc:
            logger.error(
                "[orchestrator] WORKER CRASH | Feature: %s | Queue: %s | Exception: %s",
                worker.FEATURE_NAME,
                worker.QUEUE_NAME,
                exc,
                exc_info=True,
            )
            logger.warning(
                "[orchestrator] Triggering shutdown due to worker failure..."
            )
            self._shutdown_event.set()

    def _graceful_shutdown(self) -> None:
        logger.info("[orchestrator] Graceful shutdown initiated ...")
        for worker in self._workers:
            worker.stop()
            logger.info("[orchestrator] Stop signal sent to: %s", worker.FEATURE_NAME)

        if self._executor:
            self._executor.shutdown(wait=True, cancel_futures=False)

        logger.info("[orchestrator] All worker threads terminated. Goodbye!")

    def _register_signal_handlers(self) -> None:
        def _handler(signum: int, _: object) -> None:
            logger.warning(
                "[orchestrator] Signal %d received. Initiating shutdown ...", signum
            )
            self._shutdown_event.set()

        signal.signal(signal.SIGTERM, _handler)
        signal.signal(signal.SIGINT, _handler)
