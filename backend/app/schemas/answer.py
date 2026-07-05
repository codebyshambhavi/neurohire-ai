from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SubmitAnswerRequest(BaseModel):
    question_id: str
    transcript: str | None = Field(default=None, description="Speech-to-text transcript of the response")
    duration_seconds: float | None = Field(default=None, ge=0, description="Measured speaking duration in seconds")
    audio_url: str | None = Field(default=None, description="Storage reference to the recorded audio")
    video_url: str | None = Field(default=None, description="Storage reference to the recorded video")
    face_detected: bool | None = None
    eye_contact_ratio: float | None = Field(default=None, ge=0, le=1)
    posture_score: float | None = Field(default=None, ge=0, le=100)
    movement_level: float | None = Field(default=None, ge=0, le=100)


class AnswerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    question_id: str
    transcript: str | None
    audio_url: str | None
    video_url: str | None
    submitted_at: datetime
    analysis_status: str = "pending"
