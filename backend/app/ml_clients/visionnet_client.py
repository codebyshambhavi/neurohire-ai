from app.ml_clients.base import BaseMLClient
from app.ml_clients.schemas import VisionNetInput, VisionNetResult


class VisionNetClient(BaseMLClient):
    """
    Contract for the VisionNet module: eye contact, attention, and engagement
    estimation from a recorded answer's video.

    Implementation (Phase 5+) will call the `ml-engine/visionnet` service,
    likely backed by face/landmark detection and gaze estimation run on
    sampled frames.
    """

    def analyze(self, payload: VisionNetInput) -> VisionNetResult:
        self._not_implemented("analyze")
