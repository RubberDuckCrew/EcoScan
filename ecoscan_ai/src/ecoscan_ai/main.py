#!/usr/bin/env python
import logging
import os
import sys
import warnings

from ecoscan_ai.orchestrator import Orchestrator

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

_LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, _LOG_LEVEL, logging.INFO),
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


def workers() -> None:
    Orchestrator().start()
