from pydantic import BaseModel, Field, field_validator


class SpeechMindAnalyzeRequest(BaseModel):
    transcript: str
    duration_seconds: float | None = Field(default=None, gt=0)

    @field_validator("transcript")
    @classmethod
    def reject_blank_transcript(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("must not be blank")
        return value


class SpeechMindAnalyzeResponse(BaseModel):
    pace_score: int = Field(ge=0, le=100)
    confidence_score: int = Field(ge=0, le=100)
    filler_score: int = Field(ge=0, le=100)
    delivery_score: int = Field(ge=0, le=100)
    feedback: str
