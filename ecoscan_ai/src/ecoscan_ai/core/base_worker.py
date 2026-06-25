import abc
import json
import logging
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from typing import TYPE_CHECKING

import pika
import pika.channel
import pika.spec

if TYPE_CHECKING:
    import pika.adapters.blocking_connection

from ecoscan_ai.core.models import AiDTO
from ecoscan_ai.core.rabbitmq_connection import create_blocking_connection

logger = logging.getLogger(__name__)

_RETRY_DELAY_SECONDS = 5
_LLM_RETRY_ATTEMPTS = 1
_LLM_RETRY_BACKOFF_SECONDS = 2


class BaseWorker(abc.ABC):
    QUEUE_NAME: str
    RESULT_QUEUE: str
    FEATURE_NAME: str

    def run(self) -> None:
        thread_id = threading.current_thread().name
        logger.info(
            "[%s] Worker started | Queue: %s | Thread: %s",
            self.FEATURE_NAME,
            self.QUEUE_NAME,
            thread_id,
        )

        while not self._stop_event.is_set():
            # noinspection PyBroadException
            try:
                connection = create_blocking_connection()
                channel = connection.channel()

                with self._lock:
                    self._connection = connection
                    self._channel = channel

                channel.basic_qos(prefetch_count=1)

                channel.queue_declare(queue=self.QUEUE_NAME, durable=True)
                channel.queue_declare(queue=self.RESULT_QUEUE, durable=True)

                channel.basic_consume(
                    queue=self.QUEUE_NAME,
                    on_message_callback=self._on_message,  # type: ignore[assignment]
                    auto_ack=False,
                )

                logger.info(
                    "[%s] Waiting for messages on queue '%s' ...",
                    self.FEATURE_NAME,
                    self.QUEUE_NAME,
                )
                channel.start_consuming()

            except Exception:
                if self._stop_event.is_set():
                    break
                logger.exception(
                    "[%s] Connection error. Reconnecting in %ds ...",
                    self.FEATURE_NAME,
                    _RETRY_DELAY_SECONDS,
                )
                time.sleep(_RETRY_DELAY_SECONDS)
            finally:
                with self._lock:
                    self._channel = None
                    self._connection = None

        logger.info("[%s] Worker shut down cleanly.", self.FEATURE_NAME)

    def _on_message(
        self,
        channel: pika.channel.Channel,
        method: pika.spec.Basic.Deliver,
        _: pika.spec.BasicProperties,
        body: bytes,
    ) -> None:
        job_id = "<unknown>"
        try:
            raw = json.loads(body)
            job_id = raw.get("jobId", "<unknown>")
        except json.JSONDecodeError:
            pass

        logger.info("[%s] Message received | jobId: %s", self.FEATURE_NAME, job_id)

        self._executor.submit(
            self._process_message_in_background,
            channel,
            method.delivery_tag,
            body,
            job_id,
        )

    def _process_message_in_background(
        self,
        channel: pika.channel.Channel,
        delivery_tag: int,
        body: bytes,
        job_id: str,
    ) -> None:
        """Process message in background thread and send result/ACK via callback."""
        # noinspection PyBroadException
        try:
            result_json = self._run_with_retry(body, job_id)

            def publish_and_ack() -> None:
                try:
                    channel.basic_publish(
                        exchange="",
                        routing_key=self.RESULT_QUEUE,
                        body=result_json.encode("utf-8"),
                        properties=pika.BasicProperties(
                            delivery_mode=pika.DeliveryMode.Persistent,
                            content_type="application/json",
                        ),
                    )
                    channel.basic_ack(delivery_tag=delivery_tag)
                    logger.info(
                        "[%s] Result published & ACK sent | jobId: %s",
                        self.FEATURE_NAME,
                        job_id,
                    )
                except Exception as exc:
                    logger.exception(
                        "[%s] Error publishing result for jobId: %s: %s",
                        self.FEATURE_NAME,
                        job_id,
                        exc,
                    )

            with self._lock:
                connection = self._connection
            if connection is not None:
                connection.add_callback_threadsafe(publish_and_ack)

        except Exception:
            logger.exception(
                "[%s] Unrecoverable error for jobId: %s. Nacking without requeue.",
                self.FEATURE_NAME,
                job_id,
            )

            def nack() -> None:
                try:
                    channel.basic_nack(delivery_tag=delivery_tag, requeue=False)
                except Exception as exc:
                    logger.exception(
                        "[%s] Error sending NACK for jobId: %s: %s",
                        self.FEATURE_NAME,
                        job_id,
                        exc,
                    )

            with self._lock:
                connection = self._connection
            if connection is not None:
                connection.add_callback_threadsafe(nack)

    def _run_with_retry(self, body: bytes, job_id: str) -> str:
        last_exc: Exception | None = None
        for attempt in range(1, _LLM_RETRY_ATTEMPTS + 2):
            try:
                try:
                    raw = json.loads(body)
                except json.JSONDecodeError as exc:
                    raise ValueError(f"Invalid JSON: {exc}") from exc
                return self.process(raw).model_dump_json()
            except Exception as exc:
                last_exc = exc
                if attempt <= _LLM_RETRY_ATTEMPTS:
                    delay = _LLM_RETRY_BACKOFF_SECONDS * attempt
                    logger.warning(
                        "[%s] Processing error (attempt %d/%d) | jobId: %s | Retrying in %ds | %s",
                        self.FEATURE_NAME,
                        attempt,
                        _LLM_RETRY_ATTEMPTS + 1,
                        job_id,
                        delay,
                        exc,
                    )
                    time.sleep(delay)
        raise last_exc

    @abc.abstractmethod
    def process(self, body: dict) -> AiDTO:
        pass

    def __init__(self) -> None:
        self._stop_event = threading.Event()
        self._channel: "pika.adapters.blocking_connection.BlockingChannel | None" = None
        self._connection: "pika.adapters.blocking_connection.BlockingConnection | None" = None
        self._lock = threading.Lock()
        self._executor = ThreadPoolExecutor(
            max_workers=5, thread_name_prefix="worker-bg"
        )

    def stop(self) -> None:
        self._stop_event.set()
        with self._lock:
            if self._channel is not None:
                try:
                    self._channel.stop_consuming()
                except Exception as exc:
                    logger.warning("Error stopping consumer: %s", exc)
        # Gracefully shutdown executor and wait for pending tasks
        self._executor.shutdown(wait=True)
