from fastapi import FastAPI

from app.answermind.router import router as answermind_router


<<<<<<< HEAD
app = FastAPI(title="NeuroHire ML Engine", version="1.0.0")
=======
app = FastAPI(
    title="NeuroHire ML Engine",
    description="Inference service for NeuroHire's ML modules.",
    version="0.1.0",
)

>>>>>>> answermind-engine
app.include_router(answermind_router)
