from app.ml_clients.base import BaseMLClient
from app.ml_clients.schemas import SpeechIQInput, SpeechIQResult


class SpeechIQClient(BaseMLClient):
    """
    Contract for the SpeechIQ module: confidence, fluency, filler words,
    pauses, and speaking pace from a recorded answer's audio.

    Implementation (Phase 4+) will call the `ml-engine/speechiq` service,
    likely backed by a speech-to-text pipeline plus prosodic/acoustic
    feature extraction (pitch, energy, pause detection).
    """

    def analyze(self, payload: SpeechIQInput) -> SpeechIQResult:
        self._not_implemented("analyze")
