from fastapi import APIRouter, HTTPException, status

from app.answermind.schemas import AnswerMindAnalyzeRequest, AnswerMindAnalyzeResponse


router = APIRouter(prefix="/answermind", tags=["answermind"])


@router.post("/analyze", response_model=AnswerMindAnalyzeResponse)
def analyze_answer(payload: AnswerMindAnalyzeRequest) -> AnswerMindAnalyzeResponse:
    del payload
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="AnswerMind analysis is not implemented yet.",
    )
