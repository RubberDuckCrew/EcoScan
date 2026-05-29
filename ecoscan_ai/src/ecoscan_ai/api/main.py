from fastapi import FastAPI

from ecoscan_ai.api.routes.test import router as test_router
from ecoscan_ai.api.routes.jobs import router as jobs_router
import uvicorn


app = FastAPI(title="Ecoscan AI API", version="0.1.0")
app.include_router(test_router)
app.include_router(jobs_router)

def start():
    uvicorn.run("ecoscan_ai.api.main:app", host="0.0.0.0", port=8000, reload=True)


@app.get("/health")
def health():
    return {"status": "ok", "service": "ecoscan_ai"}

