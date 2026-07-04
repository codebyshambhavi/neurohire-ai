import logging
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ml_clients.answermind_client import AnswerMindClient
from app.ml_clients.schemas import AnswerMindInput
from app.models.answer import Answer
from app.models.enums import InterviewStatus
from app.models.interview import Interview
from app.models.question import Question
from app.models.report import Report, ReportStatus
from app.schemas.answer import SubmitAnswerRequest

logger = logging.getLogger(__name__)

_answermind_client = AnswerMindClient()


def get_next_unanswered_question(interview: Interview) -> tuple[Question | None, int]:
    """Return (question, zero_based_index) for the first question without an
    Answer, in order_index order. Returns (None, total) if all are answered."""
    ordered = sorted(interview.questions, key=lambda q: q.order_index)
    for i, question in enumerate(ordered):
        if question.answer is None:
            return question, i
    return None, len(ordered)


def submit_answer(db: Session, interview: Interview, payload: SubmitAnswerRequest) -> Answer:
    question = db.get(Question, payload.question_id)
    if question is None or question.interview_id != interview.id:
        raise ValueError("Question does not belong to this interview")
    if question.answer is not None:
        raise ValueError("This question has already been answered")

    if interview.status == InterviewStatus.CREATED:
        interview.status = InterviewStatus.IN_PROGRESS

    answer = Answer(
        question_id=question.id,
        transcript=payload.transcript,
        audio_url=payload.audio_url,
        video_url=payload.video_url,
        submitted_at=datetime.utcnow(),
    )
    db.add(answer)

    # Kick off AnswerMind analysis if a transcript is available. The client is
    # a Phase 1 interface stub, so NotImplementedError is expected until the
    # ml-engine module ships — analysis simply stays pending until then.
    if payload.transcript:
        try:
            result = _answermind_client.analyze(
                AnswerMindInput(
                    question_text=question.text,
                    question_type=question.type.value,
                    transcript=payload.transcript,
                )
            )
            answer.answermind_analysis = result.__dict__
        except NotImplementedError:
            logger.info("AnswerMind analysis deferred (client not yet implemented).")

    db.commit()
    db.refresh(answer)
    return answer


def finish_interview(db: Session, interview: Interview) -> Report:
    """Mark the interview complete and create (or return) its pending Report.

    Real NeuroCore fusion is wired in Phase 6; until then the Report exists
    with status="pending" so the frontend has a stable resource to poll.
    """
    interview.status = InterviewStatus.COMPLETED
    interview.completed_at = datetime.utcnow()

    existing = db.scalars(select(Report).where(Report.interview_id == interview.id)).first()
    if existing:
        db.commit()
        return existing

    report = Report(interview_id=interview.id, status=ReportStatus.PENDING)
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
