from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import DIFFICULTY_LABELS, ROLE_LABELS
from app.models.interview import Interview
from app.models.question import Question
from app.schemas.interview import CreateInterviewRequest
from app.services.question_bank import build_question_set


def create_interview(db: Session, user_id: str, payload: CreateInterviewRequest) -> Interview:
    """Create an Interview and seed its Question rows from the static question bank."""
    interview = Interview(
        user_id=user_id,
        role=payload.role,
        experience_level=payload.experience_level,
        difficulty=payload.difficulty,
        interview_type=payload.interview_type,
        role_label=ROLE_LABELS[payload.role],
        difficulty_label=DIFFICULTY_LABELS[payload.difficulty],
    )
    db.add(interview)
    db.flush()  # assigns interview.id without committing yet

    question_set = build_question_set(payload.role, payload.difficulty, payload.interview_type)
    for index, (q_type, text) in enumerate(question_set):
        db.add(Question(interview_id=interview.id, order_index=index, type=q_type, text=text))

    db.commit()
    db.refresh(interview)
    return interview


def list_interviews_for_user(db: Session, user_id: str) -> list[Interview]:
    stmt = (
        select(Interview)
        .where(Interview.user_id == user_id)
        .order_by(Interview.created_at.desc())
    )
    return list(db.scalars(stmt).all())


def get_interview_or_none(db: Session, interview_id: str, user_id: str) -> Interview | None:
    stmt = select(Interview).where(Interview.id == interview_id, Interview.user_id == user_id)
    return db.scalars(stmt).first()


def question_count(interview: Interview) -> int:
    return len(interview.questions)
