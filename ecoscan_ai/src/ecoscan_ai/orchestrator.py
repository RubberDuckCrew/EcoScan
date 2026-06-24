import logging
import signal
import threading
from concurrent.futures import ThreadPoolExecutor
from typing import TYPE_CHECKING

from ecoscan_ai.savings.worker import SavingsWorker

if TYPE_CHECKING:
    from ecoscan_ai.core.base_worker import BaseWorker

logger = logging.getLogger(__name__)

WORKER_CLASSES: list[type["BaseWorker"]] = [
    SavingsWorker,
]


class Orchestrator:
    def __init__(self) -> None:
        self._workers: list["BaseWorker"] = [cls() for cls in WORKER_CLASSES]
        self._executor: ThreadPoolExecutor | None = None
        self._shutdown_event = threading.Event()

    def start(self) -> None:
        self._register_signal_handlers()

        self._executor = ThreadPoolExecutor(
            max_workers=len(self._workers),
            thread_name_prefix="ecoscan-worker",
        )

        for worker in self._workers:
            thread = self._executor.submit(worker.run)  # type: ignore
            logger.info(
                "[orchestrator] Worker started | Feature: %s | Queue: %s | Thread: %s",
                worker.FEATURE_NAME,
                worker.QUEUE_NAME,
                thread,
            )

        logger.info(
            "[orchestrator] All %d worker threads active. Waiting for SIGTERM/SIGINT ...",
            len(self._workers),
        )

        self._shutdown_event.wait()
        self._graceful_shutdown()

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
