from typing import Literal

from pydantic import BaseModel


class DashboardStat(BaseModel):
    """Mirrors one entry of `dashboardStats` in mock-data.ts."""
    label: str
    value: str
    delta: str
    trend: Literal["up", "down"]


class PerformancePoint(BaseModel):
    """Mirrors one entry of `performanceData` in mock-data.ts."""
    month: str
    score: int
    communication: int


class SkillBreakdownItem(BaseModel):
    """Mirrors one entry of `skillBreakdown` in mock-data.ts."""
    skill: str
    value: int


class RecentInterview(BaseModel):
    """Mirrors the `Interview` type / `recentInterviews` in mock-data.ts."""
    id: str
    role: str
    date: str
    difficulty: Literal["Beginner", "Intermediate", "Advanced"]
    score: int
    improvement: int


class Recommendation(BaseModel):
    """Mirrors one entry of `recommendations` in mock-data.ts."""
    title: str
    detail: str
    tag: Literal["AnswerMind", "SpeechIQ", "VisionNet"]


class DashboardSummaryOut(BaseModel):
    stats: list[DashboardStat]
    performance: list[PerformancePoint]
    skill_breakdown: list[SkillBreakdownItem]
    recent_interviews: list[RecentInterview]
    recommendations: list[Recommendation]
