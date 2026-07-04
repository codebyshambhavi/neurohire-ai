from fastapi import APIRouter

from app.visionmind.schemas import VisionMindAnalyzeRequest, VisionMindAnalyzeResponse
from app.visionmind.service import analyze


router = APIRouter(prefix="/visionmind", tags=["visionmind"])


@router.post("/analyze", response_model=VisionMindAnalyzeResponse)
def analyze_vision(payload: VisionMindAnalyzeRequest) -> VisionMindAnalyzeResponse:
    return analyze(payload)
