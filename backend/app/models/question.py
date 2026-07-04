from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import QuestionType


class Question(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "questions"

    interview_id: Mapped[str] = mapped_column(
        ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, index=True
    )
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    type: Mapped[QuestionType] = mapped_column(SAEnum(QuestionType, native_enum=False, length=32), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)

    interview: Mapped["Interview"] = relationship(back_populates="questions")
    answer: Mapped["Answer | None"] = relationship(
        back_populates="question", cascade="all, delete-orphan", uselist=False
    )
