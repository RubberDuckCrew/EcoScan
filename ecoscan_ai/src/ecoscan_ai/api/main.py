import os
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from ecoscan_ai.api.routes.green_score import router as green_score_router
from ecoscan_ai.api.routes.jobs import router as jobs_router
from ecoscan_ai.api.routes.savings import savings_router
from ecoscan_ai.api.routes.test import router as test_router
from ecoscan_ai.api.services.job_store import cancel_background_tasks


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.background_tasks = set()
    try:
        yield
    finally:
        await cancel_background_tasks(app.state.background_tasks)


app = FastAPI(title="Ecoscan AI API", version="0.1.0", lifespan=lifespan)
app.include_router(test_router)
app.include_router(jobs_router)
app.include_router(green_score_router)
app.include_router(savings_router)


def start():
    reload = os.getenv("RELOAD", "false").lower() == "true"
    uvicorn.run("ecoscan_ai.api.main:app", host="0.0.0.0", port=8000, reload=reload)


@app.get("/health")
def health():
    return {"status": "ok", "service": "ecoscan_ai"}
