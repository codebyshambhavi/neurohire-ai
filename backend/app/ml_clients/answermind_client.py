import httpx

from app.core.config import settings
from app.ml_clients.base import BaseMLClient
from app.ml_clients.schemas import AnswerMindInput, AnswerMindResult


class AnswerMindClientError(RuntimeError):
    """Raised when AnswerMind cannot return a valid analysis result."""


class AnswerMindClient(BaseMLClient):
    """
    Contract for the AnswerMind module: transcript understanding, relevance,
    technical correctness, clarity, structure, and completeness scoring.

    Implementation (Phase 3+) will call the `ml-engine/answermind` service,
    likely backed by an embedding model for relevance/coverage and an
    LLM for structure/completeness/feedback generation.
    """

    def __init__(self, base_url: str | None = None, timeout_seconds: int | None = None) -> None:
        self.base_url = (base_url or settings.ML_ENGINE_URL).rstrip("/")
        self.timeout_seconds = timeout_seconds or settings.ML_ENGINE_TIMEOUT_SECONDS

    def analyze(self, payload: AnswerMindInput) -> AnswerMindResult:
        try:
            response = httpx.post(
                f"{self.base_url}/answermind/analyze",
                json={
                    "question_text": payload.question_text,
                    "question_type": payload.question_type,
                    "transcript": payload.transcript,
                },
                timeout=self.timeout_seconds,
            )
            response.raise_for_status()
            data = response.json()
            return AnswerMindResult(
                relevance=_score(data, "relevance"),
                technical_correctness=_score(data, "technical_correctness"),
                clarity=_score(data, "clarity"),
                structure=_score(data, "structure"),
                completeness=_score(data, "completeness"),
                feedback=_feedback(data),
            )
        except (httpx.HTTPError, TypeError, ValueError, KeyError) as exc:
            raise AnswerMindClientError("AnswerMind analysis request failed") from exc


def _score(data: object, field: str) -> int:
    if not isinstance(data, dict):
        raise TypeError("AnswerMind response must be an object")
    value = data[field]
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not 0 <= value <= 100:
        raise ValueError(f"Invalid AnswerMind score: {field}")
    return round(value)


def _feedback(data: object) -> str:
    if not isinstance(data, dict) or not isinstance(data.get("feedback"), str):
        raise ValueError("Invalid AnswerMind feedback")
    return data["feedback"]
