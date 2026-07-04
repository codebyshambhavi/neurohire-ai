from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import Difficulty, ExperienceLevel, InterviewStatus, InterviewType, RoleTrack


class CreateInterviewRequest(BaseModel):
    """Matches the four selections made in `components/interview/create-interview.tsx`."""
    role: RoleTrack
    experience_level: ExperienceLevel
    difficulty: Difficulty
    interview_type: InterviewType


class InterviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    role: RoleTrack
    role_label: str
    experience_level: ExperienceLevel
    difficulty: Difficulty
    difficulty_label: str
    interview_type: InterviewType
    status: InterviewStatus
    created_at: datetime
    completed_at: datetime | None = None
    question_count: int = 0
