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

SPEECH_FIELDS = (
    ("pace_score", "Speaking Pace"),
    ("confidence_score", "Confidence"),
    ("filler_score", "Filler Control"),
    ("delivery_score", "Delivery"),
)

VISION_FIELDS = (
    ("eye_contact_score", "Eye Contact"),
    ("body_language_score", "Body Language"),
    ("confidence_score", "Visual Confidence"),
    ("presence_score", "Presence"),
)


def get_report_for_interview(db: Session, interview_id: str) -> Report | None:
    stmt = select(Report).where(Report.interview_id == interview_id)
    return db.scalars(stmt).first()


def populate_answermind_report(report: Report, interview: Interview) -> None:
    analyses: list[dict] = []
    speech_analyses: list[dict] = []
    vision_analyses: list[dict] = []
    speech_complete = True

    for question in interview.questions:
        answer = question.answer
        if answer is None or not answer.transcript:
            _set_pending(report)
            return

        analysis = answer.answermind_analysis
        if not _is_complete_analysis(analysis, SCORE_FIELDS):
            _set_pending(report)
            return
        analyses.append(analysis)

        speech_analysis = answer.speechiq_analysis
        if _is_complete_analysis(speech_analysis, SPEECH_FIELDS):
            speech_analyses.append(speech_analysis)
        else:
            speech_complete = False

        vision_analysis = answer.visionnet_analysis
        if _is_complete_analysis(vision_analysis, VISION_FIELDS):
            vision_analyses.append(vision_analysis)

    if not analyses:
        _set_pending(report)
        return

    averages = {
        field: round(sum(analysis[field] for analysis in analyses) / len(analyses))
        for field, _ in SCORE_FIELDS
    }
    speech_averages = (
        {
            field: round(sum(analysis[field] for analysis in speech_analyses) / len(speech_analyses))
            for field, _ in SPEECH_FIELDS
        }
        if speech_complete and speech_analyses
        else {}
    )
    vision_averages = (
        {
            field: round(sum(analysis[field] for analysis in vision_analyses) / len(vision_analyses))
            for field, _ in VISION_FIELDS
        }
        if vision_analyses
        else {}
    )
    all_scores = [*averages.values(), *speech_averages.values(), *vision_averages.values()]
    report.neuroscore = round(sum(all_scores) / len(all_scores))
    report.radar = [
        {"metric": label, "value": averages[field]}
        for field, label in SCORE_FIELDS
    ] + [
        {"metric": label, "value": speech_averages[field]}
        for field, label in SPEECH_FIELDS
        if field in speech_averages
    ] + [
        {"metric": label, "value": vision_averages[field]}
        for field, label in VISION_FIELDS
        if field in vision_averages
    ]
    report.breakdown = {
        "answermind": [
            {"label": label, "value": averages[field]}
            for field, label in SCORE_FIELDS
        ],
        "speechiq": [
            {"label": label, "value": speech_averages[field]}
            for field, label in SPEECH_FIELDS
            if field in speech_averages
        ],
        "visionnet": [
            {"label": label, "value": vision_averages[field]}
            for field, label in VISION_FIELDS
            if field in vision_averages
        ],
    }
    report.feedback = {
        "strengths": [
            f"Strong {label.lower()} across interview answers."
            for field, label in SCORE_FIELDS
            if averages[field] >= 75
        ] + [
            f"Strong {label.lower()} across interview answers."
            for field, label in SPEECH_FIELDS
            if speech_averages.get(field, 0) >= 75
        ] + [
            f"Strong {label.lower()} across interview answers."
            for field, label in VISION_FIELDS
            if vision_averages.get(field, 0) >= 75
        ],
        "improve": _unique_feedback([*analyses, *speech_analyses, *vision_analyses]),
        "practice": [],
    }
    report.status = "ready"


def _is_complete_analysis(analysis: dict | None, fields: tuple[tuple[str, str], ...]) -> bool:
    if not isinstance(analysis, dict):
        return False

    if analysis.get("status") == "failed":
        return False

    required_fields = [field for field, _ in fields]
    if any(field not in analysis or analysis[field] is None for field in required_fields):
        return False

    if "feedback" not in analysis or analysis["feedback"] is None:
        return False

    scores_are_valid = all(
        isinstance(analysis[field], int)
        and not isinstance(analysis[field], bool)
        and 0 <= analysis[field] <= 100
        for field in required_fields
    )
    return scores_are_valid and isinstance(analysis.get("feedback"), str)


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
