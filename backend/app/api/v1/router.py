from fastapi import APIRouter

from app.api.v1 import auth, dashboard, interviews, reports, sessions

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(interviews.router)
api_router.include_router(sessions.router)
api_router.include_router(reports.router)
api_router.include_router(dashboard.router)
