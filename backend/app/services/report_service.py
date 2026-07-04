from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.report import Report


def get_report_for_interview(db: Session, interview_id: str) -> Report | None:
    stmt = select(Report).where(Report.interview_id == interview_id)
    return db.scalars(stmt).first()
