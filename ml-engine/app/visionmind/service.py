from app.visionmind.schemas import VisionMindAnalyzeRequest, VisionMindAnalyzeResponse
from app.visionmind.scoring import (
    body_language_score,
    confidence_score,
    eye_contact_score,
    presence_score,
)


def _feedback(
    payload: VisionMindAnalyzeRequest,
    eye_contact: int,
    body_language: int,
    confidence: int,
) -> str:
    if not payload.face_detected:
        return "Keep your face visible and centered so visual communication can be assessed."

    suggestions: list[str] = []
    if payload.eye_contact_ratio is None:
        suggestions.append("provide eye-contact tracking data for a complete visual assessment")
    elif eye_contact < 60:
        suggestions.append("look toward the camera more consistently while answering")
    if payload.posture_score is None and payload.movement_level is None:
        suggestions.append("provide posture or movement data to assess body language")
    elif body_language < 60:
        suggestions.append("maintain upright posture and reduce excessive movement")
    if confidence < 60 and suggestions:
        suggestions.append("use steadier nonverbal cues to project confidence")

    if not suggestions:
        return "Visual presence is steady and engaged. Maintain consistent eye contact and controlled movement."
    return "; ".join(suggestions).capitalize() + "."


def analyze(payload: VisionMindAnalyzeRequest) -> VisionMindAnalyzeResponse:
    eye_contact = eye_contact_score(payload.face_detected, payload.eye_contact_ratio)
    body_language = body_language_score(
        payload.face_detected,
        payload.posture_score,
        payload.movement_level,
    )
    has_eye_contact = payload.eye_contact_ratio is not None
    has_body_language = payload.posture_score is not None or payload.movement_level is not None
    confidence = confidence_score(
        payload.face_detected,
        eye_contact,
        body_language,
        has_eye_contact,
        has_body_language,
    )
    presence = presence_score(
        payload.face_detected,
        eye_contact,
        body_language,
        confidence,
        has_eye_contact,
        has_body_language,
    )
    return VisionMindAnalyzeResponse(
        eye_contact_score=eye_contact,
        body_language_score=body_language,
        confidence_score=confidence,
        presence_score=presence,
        feedback=_feedback(payload, eye_contact, body_language, confidence),
    )
