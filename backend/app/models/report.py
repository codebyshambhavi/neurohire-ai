from sqlalchemy import JSON, Enum as SAEnum, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ReportStatus(str):
    """Lightweight status values for report generation (not a DB enum on purpose:
    keeps this easy to extend without a migration as NeuroCore fusion evolves)."""
    PENDING = "pending"
    READY = "ready"


class Report(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    Final NeuroCore fusion output for one Interview.

    Created (in `pending` status) as soon as the interview is finished, and
    populated once NeuroCoreClient.fuse() has real logic (Phase 3+). Field
    shapes mirror `frontend/lib/mock-data.ts`: `reportRadar`, `reportBreakdown`,
    and `feedback` so the frontend requires no remapping once wired up.
    """
    __tablename__ = "reports"

    interview_id: Mapped[str] = mapped_column(
        ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )

    status: Mapped[str] = mapped_column(default=ReportStatus.PENDING, nullable=False)

    neuroscore: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # list[{"metric": str, "value": int}]  -> mirrors reportRadar
    radar: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # {"answermind": [...], "speechiq": [...], "visionnet": [...]} -> mirrors reportBreakdown
    breakdown: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # {"strengths": [...], "improve": [...], "practice": [...]} -> mirrors feedback
    feedback: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    interview: Mapped["Interview"] = relationship(back_populates="report")
