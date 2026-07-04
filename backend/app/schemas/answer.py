from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SubmitAnswerRequest(BaseModel):
    question_id: str
    transcript: str | None = Field(default=None, description="Speech-to-text transcript of the response")
    audio_url: str | None = Field(default=None, description="Storage reference to the recorded audio")
    video_url: str | None = Field(default=None, description="Storage reference to the recorded video")


class AnswerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    question_id: str
    transcript: str | None
    audio_url: str | None
    video_url: str | None
    submitted_at: datetime
    analysis_status: str = "pending"
