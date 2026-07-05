import httpx

from app.core.config import settings
from app.ml_clients.base import BaseMLClient
from app.ml_clients.schemas import SpeechMindInput, SpeechMindResult


class SpeechMindClientError(RuntimeError):
    """Raised when SpeechMind cannot return a valid analysis result."""


class SpeechMindClient(BaseMLClient):
    def __init__(self, base_url: str | None = None, timeout_seconds: int | None = None) -> None:
        self.base_url = (base_url or settings.ML_ENGINE_URL).rstrip("/")
        self.timeout_seconds = (
            timeout_seconds if timeout_seconds is not None else settings.ML_ENGINE_TIMEOUT_SECONDS
        )

    def analyze(self, payload: SpeechMindInput) -> SpeechMindResult:
        try:
            response = httpx.post(
                f"{self.base_url}/speechmind/analyze",
                json={
                    "transcript": payload.transcript,
                    "duration_seconds": payload.duration_seconds,
                },
                timeout=self.timeout_seconds,
            )
            response.raise_for_status()
            data = response.json()
            return SpeechMindResult(
                pace_score=_score(data, "pace_score"),
                confidence_score=_score(data, "confidence_score"),
                filler_score=_score(data, "filler_score"),
                delivery_score=_score(data, "delivery_score"),
                feedback=_feedback(data),
            )
        except (httpx.HTTPError, TypeError, ValueError, KeyError) as exc:
            raise SpeechMindClientError(f"SpeechMind analysis request failed: {exc}") from exc


def _score(data: object, field: str) -> int:
    if not isinstance(data, dict):
        raise TypeError("SpeechMind response must be an object")
    value = data[field]
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not 0 <= value <= 100:
        raise ValueError(f"Invalid SpeechMind score: {field}")
    return round(value)


def _feedback(data: object) -> str:
    if not isinstance(data, dict) or not isinstance(data.get("feedback"), str):
        raise ValueError("Invalid SpeechMind feedback")
    return data["feedback"]
