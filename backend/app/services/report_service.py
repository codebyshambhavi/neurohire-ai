from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.interview import Interview
from app.models.report import Report


SCORE_FIELDS = (
    ("relevance", "Relevance"),
    ("technical_correctness", "Technical Correctness"),
    ("clarity", "Clarity"),
    ("structure", "Structure"),
    ("completeness", "Completeness"),
)


def get_report_for_interview(db: Session, interview_id: str) -> Report | None:
    stmt = select(Report).where(Report.interview_id == interview_id)
    return db.scalars(stmt).first()


def populate_answermind_report(report: Report, interview: Interview) -> None:
    analyses: list[dict] = []

    for question in interview.questions:
        answer = question.answer
        if answer is None or not answer.transcript:
            _set_pending(report)
            return

        analysis = answer.answermind_analysis
        if not _is_complete_analysis(analysis):
            _set_pending(report)
            return
        analyses.append(analysis)

    if not analyses:
        _set_pending(report)
        return

    averages = {
        field: round(sum(analysis[field] for analysis in analyses) / len(analyses))
        for field, _ in SCORE_FIELDS
    }
    report.neuroscore = round(sum(averages.values()) / len(averages))
    report.radar = [
        {"metric": label, "value": averages[field]}
        for field, label in SCORE_FIELDS
    ]
    report.breakdown = {
        "answermind": [
            {"label": label, "value": averages[field]}
            for field, label in SCORE_FIELDS
        ],
        "speechiq": [],
        "visionnet": [],
    }
    report.feedback = {
        "strengths": [
            f"Strong {label.lower()} across interview answers."
            for field, label in SCORE_FIELDS
            if averages[field] >= 75
        ],
        "improve": _unique_feedback(analyses),
        "practice": [],
    }
    report.status = "ready"


def _is_complete_analysis(analysis: dict | None) -> bool:
    if not isinstance(analysis, dict) or analysis.get("status") == "failed":
        return False
    return all(
        isinstance(analysis.get(field), int) and 0 <= analysis[field] <= 100
        for field, _ in SCORE_FIELDS
    ) and isinstance(analysis.get("feedback"), str)


def _unique_feedback(analyses: list[dict]) -> list[str]:
    return list(
        dict.fromkeys(
            analysis["feedback"]
            for analysis in analyses
            if analysis["feedback"].strip()
        )
    )


def _set_pending(report: Report) -> None:
    report.status = "pending"
    report.neuroscore = None
    report.radar = []
    report.breakdown = {"answermind": [], "speechiq": [], "visionnet": []}
    report.feedback = {"strengths": [], "improve": [], "practice": []}
