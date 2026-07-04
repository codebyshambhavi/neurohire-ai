from app.ml_clients.base import BaseMLClient
from app.ml_clients.schemas import NeuroCoreInput, NeuroCoreResult


class NeuroCoreClient(BaseMLClient):
    """
    Contract for the NeuroCore fusion layer: combines per-question AnswerMind,
    SpeechIQ, and VisionNet results for a completed interview into a single
    NeuroScore, skill radar, per-module breakdown, and improvement plan.

    Implementation (Phase 6) will call the `ml-engine/neurocore` service.
    The fusion strategy (weighted average vs. learned model) is an open
    design decision left for that phase.
    """

    def fuse(self, payload: NeuroCoreInput) -> NeuroCoreResult:
        self._not_implemented("fuse")
