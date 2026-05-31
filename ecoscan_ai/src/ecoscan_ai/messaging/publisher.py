import aio_pika
import os

from ecoscan_ai.api.schemas.jobs import JobResponse


async def publish_job_result(job: JobResponse):
    connection = await aio_pika.connect_robust(
        host=os.getenv("RABBITMQ_HOST", "localhost"),
        login=os.getenv("RABBITMQ_USER", "admin"),
        password=os.getenv("RABBITMQ_PASS", "admin"),
    )
    async with connection:
        channel = await connection.channel()
        await channel.declare_queue("ai_results", durable=True)

        message = aio_pika.Message(
            body=job.model_dump_json().encode(),
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
            content_type="application/json",
        )
        await channel.default_exchange.publish(
            message, routing_key="ai_results"
        )