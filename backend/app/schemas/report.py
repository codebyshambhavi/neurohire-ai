from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RadarMetric(BaseModel):
    """Mirrors one entry of `reportRadar` in mock-data.ts."""
    metric: str
    value: int


class BreakdownMetric(BaseModel):
    """Mirrors one entry inside `reportBreakdown.{module}` in mock-data.ts."""
    label: str
    value: int


class ModuleBreakdown(BaseModel):
    """Mirrors the shape of `reportBreakdown` in mock-data.ts."""
    answermind: list[BreakdownMetric] = []
    speechiq: list[BreakdownMetric] = []
    visionnet: list[BreakdownMetric] = []


class Feedback(BaseModel):
    """Mirrors `feedback` in mock-data.ts."""
    strengths: list[str] = []
    improve: list[str] = []
    practice: list[str] = []


class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    interview_id: str
    status: str  # "pending" | "ready"
    neuroscore: int | None = None
    radar: list[RadarMetric] = []
    breakdown: ModuleBreakdown = ModuleBreakdown()
    feedback: Feedback = Feedback()
    created_at: datetime
