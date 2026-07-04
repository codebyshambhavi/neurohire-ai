from app.speechmind.schemas import SpeechMindAnalyzeRequest, SpeechMindAnalyzeResponse
from app.speechmind.scoring import (
    confidence_score,
    delivery_score,
    filler_score,
    pace_score,
    sentence_flow_score,
)


def _feedback(pace: int, confidence: int, filler: int, flow: int, has_duration: bool) -> str:
    suggestions: list[str] = []
    if pace < 60:
        suggestions.append("adjust your speaking pace toward a steady 120 to 170 words per minute")
    elif not has_duration:
        suggestions.append("provide audio duration for a measured words-per-minute pace score")
    if filler < 70:
        suggestions.append("replace filler words with brief silent pauses")
    if confidence < 65:
        suggestions.append("reduce hesitation and repeated wording to sound more decisive")
    if flow < 60:
        suggestions.append("use complete, moderately sized sentences for smoother delivery")

    if not suggestions:
        return "Delivery is well paced, confident, and fluent. Maintain the same controlled speaking rhythm."
    return "; ".join(suggestions).capitalize() + "."


def analyze(payload: SpeechMindAnalyzeRequest) -> SpeechMindAnalyzeResponse:
    pace = pace_score(payload.transcript, payload.duration_seconds)
    confidence = confidence_score(payload.transcript)
    filler = filler_score(payload.transcript)
    flow = sentence_flow_score(payload.transcript)
    delivery = delivery_score(pace, confidence, filler, flow)
    return SpeechMindAnalyzeResponse(
        pace_score=pace,
        confidence_score=confidence,
        filler_score=filler,
        delivery_score=delivery,
        feedback=_feedback(pace, confidence, filler, flow, payload.duration_seconds is not None),
    )
