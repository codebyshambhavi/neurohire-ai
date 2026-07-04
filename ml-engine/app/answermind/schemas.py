from pydantic import BaseModel, Field, field_validator


class AnswerMindAnalyzeRequest(BaseModel):
    question_text: str
    question_type: str
    transcript: str

    @field_validator("question_text", "question_type", "transcript")
    @classmethod
    def reject_blank_text(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("must not be blank")
        return value


class AnswerMindAnalyzeResponse(BaseModel):
    relevance: int = Field(ge=0, le=100)
    technical_correctness: int = Field(ge=0, le=100)
    clarity: int = Field(ge=0, le=100)
    structure: int = Field(ge=0, le=100)
    completeness: int = Field(ge=0, le=100)
    feedback: str
