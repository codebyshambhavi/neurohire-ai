from app.ml_clients.base import BaseMLClient
from app.ml_clients.schemas import AnswerMindInput, AnswerMindResult


class AnswerMindClient(BaseMLClient):
    """
    Contract for the AnswerMind module: transcript understanding, relevance,
    technical correctness, clarity, structure, and completeness scoring.

    Implementation (Phase 3+) will call the `ml-engine/answermind` service,
    likely backed by an embedding model for relevance/coverage and an
    LLM for structure/completeness/feedback generation.
    """

    def analyze(self, payload: AnswerMindInput) -> AnswerMindResult:
        self._not_implemented("analyze")
