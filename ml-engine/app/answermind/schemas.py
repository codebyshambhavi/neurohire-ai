from pydantic import BaseModel, Field


class AnswerMindAnalyzeRequest(BaseModel):
    question_text: str
    question_type: str
    transcript: str


class AnswerMindAnalyzeResponse(BaseModel):
    relevance: int = Field(ge=0, le=100)
    technical_correctness: int = Field(ge=0, le=100)
    clarity: int = Field(ge=0, le=100)
    structure: int = Field(ge=0, le=100)
    completeness: int = Field(ge=0, le=100)
    feedback: str
