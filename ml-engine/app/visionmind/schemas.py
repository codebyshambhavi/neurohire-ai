from pydantic import BaseModel, Field


class VisionMindAnalyzeRequest(BaseModel):
    face_detected: bool
    eye_contact_ratio: float | None = Field(default=None, ge=0, le=1)
    posture_score: float | None = Field(default=None, ge=0, le=100)
    movement_level: float | None = Field(default=None, ge=0, le=100)


class VisionMindAnalyzeResponse(BaseModel):
    eye_contact_score: int = Field(ge=0, le=100)
    body_language_score: int = Field(ge=0, le=100)
    confidence_score: int = Field(ge=0, le=100)
    presence_score: int = Field(ge=0, le=100)
    feedback: str
