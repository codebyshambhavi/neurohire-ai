import logging
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ml_clients.answermind_client import AnswerMindClient, AnswerMindClientError
from app.ml_clients.schemas import AnswerMindInput, SpeechMindInput, VisionMindInput
from app.ml_clients.speechmind_client import SpeechMindClient, SpeechMindClientError
from app.ml_clients.visionmind_client import VisionMindClient, VisionMindClientError
from app.models.answer import Answer
from app.models.enums import InterviewStatus
from app.models.interview import Interview
from app.models.question import Question
from app.models.report import Report, ReportStatus
from app.schemas.answer import SubmitAnswerRequest
from app.services import report_service

logger = logging.getLogger(__name__)

_answermind_client = AnswerMindClient()
_speechmind_client = SpeechMindClient()
_visionmind_client = VisionMindClient()


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

    # Analysis failures are stored as status metadata and never roll back the answer.
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
        except AnswerMindClientError as exc:
            answer.answermind_analysis = {"status": "failed", "error": str(exc)}
            logger.warning("AnswerMind analysis failed; answer submission will continue.", exc_info=True)

        try:
            speech_result = _speechmind_client.analyze(
                SpeechMindInput(transcript=payload.transcript, duration_seconds=None)
            )
            answer.speechiq_analysis = speech_result.__dict__
        except SpeechMindClientError as exc:
            answer.speechiq_analysis = {"status": "failed", "error": str(exc)}
            logger.warning("SpeechMind analysis failed; answer submission will continue.", exc_info=True)

    if payload.face_detected is not None:
        try:
            vision_result = _visionmind_client.analyze(
                VisionMindInput(
                    face_detected=payload.face_detected,
                    eye_contact_ratio=payload.eye_contact_ratio,
                    posture_score=payload.posture_score,
                    movement_level=payload.movement_level,
                )
            )
            answer.visionnet_analysis = vision_result.__dict__
        except VisionMindClientError as exc:
            answer.visionnet_analysis = {"status": "failed", "error": str(exc)}
            logger.warning("VisionMind analysis failed; answer submission will continue.", exc_info=True)

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
        report_service.populate_answermind_report(existing, interview)
        db.commit()
        db.refresh(existing)
        return existing

    report = Report(interview_id=interview.id, status=ReportStatus.PENDING)
    report_service.populate_answermind_report(report, interview)
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
