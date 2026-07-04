from fastapi import APIRouter

from app.speechmind.schemas import SpeechMindAnalyzeRequest, SpeechMindAnalyzeResponse
from app.speechmind.service import analyze


router = APIRouter(prefix="/speechmind", tags=["speechmind"])


@router.post("/analyze", response_model=SpeechMindAnalyzeResponse)
def analyze_speech(payload: SpeechMindAnalyzeRequest) -> SpeechMindAnalyzeResponse:
    return analyze(payload)
