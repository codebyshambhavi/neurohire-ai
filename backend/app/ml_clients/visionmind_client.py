import httpx

from app.core.config import settings
from app.ml_clients.base import BaseMLClient
from app.ml_clients.schemas import VisionMindInput, VisionMindResult


class VisionMindClientError(RuntimeError):
    """Raised when VisionMind cannot return a valid analysis result."""


class VisionMindClient(BaseMLClient):
    def __init__(self, base_url: str | None = None, timeout_seconds: int | None = None) -> None:
        self.base_url = (base_url or settings.ML_ENGINE_URL).rstrip("/")
        self.timeout_seconds = timeout_seconds or settings.ML_ENGINE_TIMEOUT_SECONDS

    def analyze(self, payload: VisionMindInput) -> VisionMindResult:
        try:
            response = httpx.post(
                f"{self.base_url}/visionmind/analyze",
                json={
                    "face_detected": payload.face_detected,
                    "eye_contact_ratio": payload.eye_contact_ratio,
                    "posture_score": payload.posture_score,
                    "movement_level": payload.movement_level,
                },
                timeout=self.timeout_seconds,
            )
            response.raise_for_status()
            data = response.json()
            return VisionMindResult(
                eye_contact_score=_score(data, "eye_contact_score"),
                body_language_score=_score(data, "body_language_score"),
                confidence_score=_score(data, "confidence_score"),
                presence_score=_score(data, "presence_score"),
                feedback=_feedback(data),
            )
        except (httpx.HTTPError, TypeError, ValueError, KeyError) as exc:
            raise VisionMindClientError("VisionMind analysis request failed") from exc


def _score(data: object, field: str) -> int:
    if not isinstance(data, dict):
        raise TypeError("VisionMind response must be an object")
    value = data[field]
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not 0 <= value <= 100:
        raise ValueError(f"Invalid VisionMind score: {field}")
    return round(value)


def _feedback(data: object) -> str:
    if not isinstance(data, dict) or not isinstance(data.get("feedback"), str):
        raise ValueError("Invalid VisionMind feedback")
    return data["feedback"]
