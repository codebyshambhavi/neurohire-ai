"""
Domain enums shared by SQLAlchemy models and Pydantic schemas.

Values are kept identical to the option `id`s already used in the frontend
(`components/interview/create-interview.tsx`) so request/response payloads
need no translation layer.
"""
from enum import Enum


class RoleTrack(str, Enum):
    SWE = "swe"
    ML = "ml"
    DATA_ANALYST = "da"
    PRODUCT_MANAGER = "pm"


class ExperienceLevel(str, Enum):
    STUDENT = "student"
    INTERN = "intern"
    PROFESSIONAL = "pro"


class Difficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class InterviewType(str, Enum):
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    MIXED = "mixed"


class QuestionType(str, Enum):
    WARM_UP = "Warm-up"
    TECHNICAL = "Technical"
    SYSTEM_DESIGN = "System Design"
    BEHAVIORAL = "Behavioral"


class InterviewStatus(str, Enum):
    CREATED = "created"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


# Display labels for values that the frontend renders capitalized
# (e.g. dashboard's `recentInterviews[].difficulty` shows "Advanced", not "advanced").
DIFFICULTY_LABELS: dict[Difficulty, str] = {
    Difficulty.BEGINNER: "Beginner",
    Difficulty.INTERMEDIATE: "Intermediate",
    Difficulty.ADVANCED: "Advanced",
}

ROLE_LABELS: dict[RoleTrack, str] = {
    RoleTrack.SWE: "Software Engineer",
    RoleTrack.ML: "ML Engineer",
    RoleTrack.DATA_ANALYST: "Data Analyst",
    RoleTrack.PRODUCT_MANAGER: "Product Manager",
}
