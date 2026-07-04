<<<<<<< HEAD
from fastapi import APIRouter

from app.answermind.schemas import AnswerMindAnalyzeRequest, AnswerMindAnalyzeResponse
from app.answermind.service import analyze
=======
from fastapi import APIRouter, HTTPException, status

from app.answermind.schemas import AnswerMindAnalyzeRequest, AnswerMindAnalyzeResponse
>>>>>>> answermind-engine


router = APIRouter(prefix="/answermind", tags=["answermind"])


@router.post("/analyze", response_model=AnswerMindAnalyzeResponse)
def analyze_answer(payload: AnswerMindAnalyzeRequest) -> AnswerMindAnalyzeResponse:
<<<<<<< HEAD
    return analyze(payload)
=======
    del payload
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="AnswerMind analysis is not implemented yet.",
    )
>>>>>>> answermind-engine
