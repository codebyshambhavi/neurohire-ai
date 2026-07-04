"""
Base class for all ML module clients.

Each concrete client (AnswerMindClient, SpeechIQClient, VisionNetClient,
NeuroCoreClient) will eventually make an HTTP/gRPC call to the standalone
`ml-engine` service. In this phase they only define the contract: calling
them raises NotImplementedError so callers fail loudly instead of silently
returning fabricated scores.
"""
from abc import ABC


class BaseMLClient(ABC):
    """Marker base class. Concrete clients implement one `analyze`/`fuse` method
    with a typed input/output pair from `ml_clients.schemas`."""

    #: Base URL of the ml-engine service this client talks to (set in Phase 3+).
    base_url: str | None = None

    def _not_implemented(self, method_name: str) -> None:
        raise NotImplementedError(
            f"{self.__class__.__name__}.{method_name} is not implemented yet. "
            "This is a Phase 1 interface stub — real inference is wired up when "
            "the corresponding ml-engine module ships."
        )
