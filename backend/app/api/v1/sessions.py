from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.enums import InterviewStatus
from app.models.user import User
from app.schemas.answer import AnswerOut, SubmitAnswerRequest
from app.schemas.question import QuestionOut
from app.schemas.session import FinishSessionResponse, SessionQuestionOut
from app.services import interview_service, session_service

router = APIRouter(prefix="/sessions", tags=["sessions"])


def _get_owned_interview(db: Session, interview_id: str, user: User):
    interview = interview_service.get_interview_or_none(db, interview_id, user.id)
    if interview is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    return interview


@router.get("/{interview_id}/question", response_model=SessionQuestionOut)
def get_current_question(
    interview_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SessionQuestionOut:
    interview = _get_owned_interview(db, interview_id, current_user)
    total = len(interview.questions)
    question, index = session_service.get_next_unanswered_question(interview)

    return SessionQuestionOut(
        interview_id=interview.id,
        question=QuestionOut.model_validate(question) if question else None,
        question_index=index,
        total_questions=total,
        is_last=(question is not None and index == total - 1),
        is_complete=question is None,
    )


@router.post("/{interview_id}/answer", response_model=AnswerOut, status_code=status.HTTP_201_CREATED)
def submit_answer(
    interview_id: str,
    payload: SubmitAnswerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnswerOut:
    interview = _get_owned_interview(db, interview_id, current_user)
    if interview.status == InterviewStatus.COMPLETED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Interview already completed")

    try:
        answer = session_service.submit_answer(db, interview, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    analyses = (answer.answermind_analysis, answer.speechiq_analysis)
    analysis_status = (
        "failed"
        if any(analysis and analysis.get("status") == "failed" for analysis in analyses)
        else "analyzed"
        if all(analysis for analysis in analyses)
        else "pending"
    )
    return AnswerOut(
        id=answer.id,
        question_id=answer.question_id,
        transcript=answer.transcript,
        audio_url=answer.audio_url,
        video_url=answer.video_url,
        submitted_at=answer.submitted_at,
        analysis_status=analysis_status,
    )


@router.post("/{interview_id}/finish", response_model=FinishSessionResponse)
def finish_session(
    interview_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FinishSessionResponse:
    interview = _get_owned_interview(db, interview_id, current_user)
    report = session_service.finish_interview(db, interview)
    return FinishSessionResponse(interview_id=interview.id, report_id=report.id, status=report.status)
