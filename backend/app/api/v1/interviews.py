from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.interview import CreateInterviewRequest, InterviewOut
from app.services import interview_service

router = APIRouter(prefix="/interviews", tags=["interviews"])


def _to_interview_out(interview) -> InterviewOut:
    return InterviewOut(
        id=interview.id,
        role=interview.role,
        role_label=interview.role_label,
        experience_level=interview.experience_level,
        difficulty=interview.difficulty,
        difficulty_label=interview.difficulty_label,
        interview_type=interview.interview_type,
        status=interview.status,
        created_at=interview.created_at,
        completed_at=interview.completed_at,
        question_count=len(interview.questions),
    )


@router.post("", response_model=InterviewOut, status_code=status.HTTP_201_CREATED)
def create_interview(
    payload: CreateInterviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InterviewOut:
    interview = interview_service.create_interview(db, current_user.id, payload)
    return _to_interview_out(interview)


@router.get("", response_model=list[InterviewOut])
def list_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[InterviewOut]:
    interviews = interview_service.list_interviews_for_user(db, current_user.id)
    return [_to_interview_out(i) for i in interviews]


@router.get("/{interview_id}", response_model=InterviewOut)
def get_interview(
    interview_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InterviewOut:
    interview = interview_service.get_interview_or_none(db, interview_id, current_user.id)
    if interview is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    return _to_interview_out(interview)
