"""
I/O contracts shared by every ML client interface.

These are plain dataclasses (not Pydantic) so `ml_clients/` has zero
dependency on the web framework and can be reused as-is by the standalone
`ml-engine` service in later phases.
"""
from dataclasses import dataclass, field


@dataclass
class AnswerMindInput:
    question_text: str
    question_type: str
    transcript: str


@dataclass
class AnswerMindResult:
    relevance: int          # 0-100, how directly the answer addresses the question
    technical_correctness: int  # 0-100
    clarity: int             # 0-100
    structure: int            # 0-100
    completeness: int         # 0-100
    feedback: str             # short natural-language improvement note


@dataclass
class SpeechIQInput:
    audio_url: str


@dataclass
class SpeechIQResult:
    confidence: int    # 0-100
    fluency: int        # 0-100
    filler_word_count: int
    pace_wpm: int
    pause_score: int    # 0-100, higher = more natural pausing


@dataclass
class VisionNetInput:
    video_url: str


@dataclass
class VisionNetResult:
    eye_contact: int    # 0-100
    attention: int       # 0-100
    engagement: int      # 0-100


@dataclass
class NeuroCoreInput:
    answermind_results: list[AnswerMindResult] = field(default_factory=list)
    speechiq_results: list[SpeechIQResult] = field(default_factory=list)
    visionnet_results: list[VisionNetResult] = field(default_factory=list)


@dataclass
class NeuroCoreResult:
    neuroscore: int                     # 0-100 fused score
    radar: list[dict]                    # [{"metric": str, "value": int}, ...]
    breakdown: dict                      # {"answermind": [...], "speechiq": [...], "visionnet": [...]}
    strengths: list[str]
    improve: list[str]
    practice: list[str]
