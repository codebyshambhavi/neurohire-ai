from fastapi import FastAPI

from app.answermind.router import router as answermind_router


app = FastAPI(title="NeuroHire ML Engine", version="1.0.0")
app.include_router(answermind_router)
