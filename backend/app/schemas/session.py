from pydantic import BaseModel

from app.schemas.question import QuestionOut


class SessionQuestionOut(BaseModel):
    """Response for GET /sessions/{id}/question — the next unanswered question,
    plus enough progress info to drive the frontend's "Question X of Y" badge
    and progress bar without a second request."""

    interview_id: str
    question: QuestionOut | None
    question_index: int  # 0-based index of `question` within the interview
    total_questions: int
    is_last: bool
    is_complete: bool  # true when there is no next question (all answered)


class FinishSessionResponse(BaseModel):
    interview_id: str
    report_id: str
    status: str
