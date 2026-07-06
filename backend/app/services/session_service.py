import logging
from concurrent.futures import Future, ThreadPoolExecutor
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
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


def _run_answermind(question_text: str, question_type: str, transcript: str) -> dict:
    try:
        result = _answermind_client.analyze(
            AnswerMindInput(
                question_text=question_text,
                question_type=question_type,
                transcript=transcript,
            )
        )
        return result.__dict__
    except AnswerMindClientError as exc:
        logger.warning("AnswerMind analysis failed; answer submission will continue.", exc_info=True)
        return {"status": "failed", "error": str(exc)}


def _run_speechmind(transcript: str, duration_seconds: float | None) -> dict:
    try:
        speech_result = _speechmind_client.analyze(
            SpeechMindInput(transcript=transcript, duration_seconds=duration_seconds)
        )
        return speech_result.__dict__
    except SpeechMindClientError as exc:
        logger.warning("SpeechMind analysis failed; answer submission will continue.", exc_info=True)
        return {"status": "failed", "error": str(exc)}


def _run_visionmind(
    face_detected: bool,
    eye_contact_ratio: float | None,
    posture_score: float | None,
    movement_level: float | None,
) -> dict:
    try:
        vision_result = _visionmind_client.analyze(
            VisionMindInput(
                face_detected=face_detected,
                eye_contact_ratio=eye_contact_ratio,
                posture_score=posture_score,
                movement_level=movement_level,
            )
        )
        return vision_result.__dict__
    except VisionMindClientError as exc:
        logger.warning("VisionMind analysis failed; answer submission will continue.", exc_info=True)
        return {"status": "failed", "error": str(exc)}


def submit_answer(db: Session, interview: Interview, payload: SubmitAnswerRequest) -> Answer:
    """Validate, persist, and return the Answer immediately.

    ML analysis (AnswerMind/SpeechMind/VisionMind) is intentionally NOT run
    here — it's dispatched as a FastAPI background task by the route layer
    (see api/v1/sessions.py) via `analyze_answer_background`, so the client
    gets an instant response and can advance to the next question without
    waiting on inference.
    """
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
    db.commit()
    db.refresh(answer)
    return answer


def analyze_answer_background(
    answer_id: str,
    question_text: str,
    question_type: str,
    transcript: str | None,
    duration_seconds: float | None,
    face_detected: bool | None,
    eye_contact_ratio: float | None,
    posture_score: float | None,
    movement_level: float | None,
) -> None:
    """Runs after the HTTP response for submit_answer has already been sent.

    Must only receive primitives (never SQLAlchemy objects, never the
    request-scoped Session) because it executes after the request that
    triggered it has already returned and its `db` session has been closed.
    Opens and closes its own Session so it's safe to run on FastAPI's
    background-task thread independent of the request lifecycle.
    """
    db = SessionLocal()
    try:
        answer = db.get(Answer, answer_id)
        if answer is None:
            logger.warning("analyze_answer_background: answer %s no longer exists.", answer_id)
            return

        # Analysis failures are stored as status metadata and never roll back the answer.
        futures: dict[str, Future] = {}
        with ThreadPoolExecutor(max_workers=3) as executor:
            if transcript:
                futures["answermind"] = executor.submit(_run_answermind, question_text, question_type, transcript)
                futures["speechiq"] = executor.submit(_run_speechmind, transcript, duration_seconds)

            if face_detected is not None:
                futures["visionnet"] = executor.submit(
                    _run_visionmind, face_detected, eye_contact_ratio, posture_score, movement_level
                )

            if "answermind" in futures:
                answer.answermind_analysis = futures["answermind"].result()
            if "speechiq" in futures:
                answer.speechiq_analysis = futures["speechiq"].result()
            if "visionnet" in futures:
                answer.visionnet_analysis = futures["visionnet"].result()

        db.commit()
    except Exception:
        logger.exception("analyze_answer_background: unexpected failure for answer %s", answer_id)
        db.rollback()
    finally:
        db.close()


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
