import asyncio
import logging
import os

import aio_pika
from ecoscan_ai.api.schemas.jobs import JobResponse

RESULTS_QUEUE = "ai_results"
RESULTS_DEAD_LETTER_QUEUE = "ai_results.dead"
PUBLISH_ATTEMPTS = 3
PUBLISH_RETRY_DELAY_SECONDS = 1.0

logger = logging.getLogger(__name__)


async def _declare_job_result_queues(channel) -> None:
    await channel.declare_queue(
        RESULTS_QUEUE,
        durable=True,
        arguments={
            "x-dead-letter-exchange": "",
            "x-dead-letter-routing-key": RESULTS_DEAD_LETTER_QUEUE,
        },
    )
    await channel.declare_queue(RESULTS_DEAD_LETTER_QUEUE, durable=True)


async def publish_job_result(job: JobResponse) -> bool:
    message = aio_pika.Message(
        body=job.model_dump_json().encode(),
        delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
        content_type="application/json",
    )

    for attempt in range(1, PUBLISH_ATTEMPTS + 1):
        try:
            connection = await aio_pika.connect_robust(
                host=os.getenv("RABBITMQ_HOST", "localhost"),
                login=os.getenv("RABBITMQ_USER", "admin"),
                password=os.getenv("RABBITMQ_PASS", "admin"),
            )
            async with connection:
                channel = await connection.channel()
                await _declare_job_result_queues(channel)
                await channel.default_exchange.publish(
                    message, routing_key=RESULTS_QUEUE
                )
                return True
        except Exception:
            if attempt == PUBLISH_ATTEMPTS:
                logger.exception(
                    "Failed to publish job result for job %s after %s attempts",
                    job.job_id,
                    PUBLISH_ATTEMPTS,
                )
                return False

            logger.warning(
                "Publish attempt %s/%s failed for job %s; retrying in %.1fs",
                attempt,
                PUBLISH_ATTEMPTS,
                job.job_id,
                PUBLISH_RETRY_DELAY_SECONDS * attempt,
            )
            await asyncio.sleep(PUBLISH_RETRY_DELAY_SECONDS * attempt)
