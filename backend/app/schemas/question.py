from pydantic import BaseModel, ConfigDict

from app.models.enums import QuestionType


class QuestionOut(BaseModel):
    """Mirrors `interviewQuestions` items in `lib/mock-data.ts` (`id`, `type`, `text`)."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    type: QuestionType
    text: str
    order_index: int
