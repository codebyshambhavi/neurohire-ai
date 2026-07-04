from fastapi import APIRouter

from app.answermind.schemas import AnswerMindAnalyzeRequest, AnswerMindAnalyzeResponse
from app.answermind.service import analyze


router = APIRouter(prefix="/answermind", tags=["answermind"])


@router.post("/analyze", response_model=AnswerMindAnalyzeResponse)
def analyze_answer(payload: AnswerMindAnalyzeRequest) -> AnswerMindAnalyzeResponse:
    return analyze(payload)
