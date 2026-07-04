from datetime import datetime

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import Difficulty, ExperienceLevel, InterviewStatus, InterviewType, RoleTrack


class Interview(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "interviews"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    role: Mapped[RoleTrack] = mapped_column(SAEnum(RoleTrack, native_enum=False, length=32), nullable=False)
    experience_level: Mapped[ExperienceLevel] = mapped_column(
        SAEnum(ExperienceLevel, native_enum=False, length=32), nullable=False
    )
    difficulty: Mapped[Difficulty] = mapped_column(SAEnum(Difficulty, native_enum=False, length=32), nullable=False)
    interview_type: Mapped[InterviewType] = mapped_column(
        SAEnum(InterviewType, native_enum=False, length=32), nullable=False
    )
    status: Mapped[InterviewStatus] = mapped_column(
        SAEnum(InterviewStatus, native_enum=False, length=32),
        default=InterviewStatus.CREATED,
        nullable=False,
    )

    # Denormalized label kept in sync at creation time so list/report endpoints
    # don't need a join just to render "ML Engineer", "Advanced", etc.
    role_label: Mapped[str] = mapped_column(String(64), nullable=False)
    difficulty_label: Mapped[str] = mapped_column(String(32), nullable=False)

    completed_at: Mapped[datetime | None] = mapped_column(nullable=True)

    user: Mapped["User"] = relationship(back_populates="interviews")
    questions: Mapped[list["Question"]] = relationship(
        back_populates="interview", cascade="all, delete-orphan", order_by="Question.order_index"
    )
    report: Mapped["Report | None"] = relationship(
        back_populates="interview", cascade="all, delete-orphan", uselist=False
    )
