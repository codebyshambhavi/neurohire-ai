from datetime import datetime

from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Answer(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    One candidate response to one Question.

    `*_analysis` columns store the raw JSON payload returned by the
    corresponding ML module client. They are nullable because analysis is
    performed asynchronously after submission (see ml_clients/ — interfaces
    only in this phase, real inference lands in later phases). A null value
    means "not yet analyzed", not "scored zero".
    """
    __tablename__ = "answers"

    question_id: Mapped[str] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )

    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    audio_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    video_url: Mapped[str | None] = mapped_column(String(512), nullable=True)

    submitted_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

    answermind_analysis: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    speechiq_analysis: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    visionnet_analysis: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    question: Mapped["Question"] = relationship(back_populates="answer")
