from fastapi import FastAPI

from app.answermind.router import router as answermind_router


app = FastAPI(
    title="NeuroHire ML Engine",
    description="Inference service for NeuroHire's ML modules.",
    version="0.1.0",
)

app.include_router(answermind_router)
