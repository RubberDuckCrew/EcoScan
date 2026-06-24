import logging
import os

import pika

logger = logging.getLogger(__name__)


def create_blocking_connection() -> pika.BlockingConnection:
    host = os.getenv("RABBITMQ_HOST", "localhost")
    port = int(os.getenv("RABBITMQ_PORT", "5672"))
    user = os.getenv("RABBITMQ_USER", "admin")
    password = os.getenv("RABBITMQ_PASS", "admin")
    vhost = os.getenv("RABBITMQ_VHOST", "/")

    credentials = pika.PlainCredentials(user, password)
    parameters = pika.ConnectionParameters(
        host=host,
        port=port,
        virtual_host=vhost,
        credentials=credentials,
        heartbeat=600,
        blocked_connection_timeout=300,
    )
    logger.debug("Connecting with RabbitMQ: %s:%d%s", host, port, vhost)
    return pika.BlockingConnection(parameters)
