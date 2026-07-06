from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.answermind.embeddings import get_embedding_model
from app.answermind.router import router as answermind_router
from app.speechmind.router import router as speechmind_router
from app.visionmind.router import router as visionmind_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_embedding_model()
    yield


app = FastAPI(
    title="NeuroHire ML Engine",
    description="Inference service for NeuroHire's ML modules.",
    version="1.0.0",
    lifespan=lifespan,
)


app.include_router(answermind_router)
app.include_router(speechmind_router)
app.include_router(visionmind_router)