from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.report import ReportOut
from app.services import interview_service, report_service

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/{interview_id}", response_model=ReportOut)
def get_report(
    interview_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReportOut:
    # Ownership check goes through the interview first so a user can't probe
    # for another user's report by guessing an interview id.
    interview = interview_service.get_interview_or_none(db, interview_id, current_user.id)
    if interview is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    report = report_service.get_report_for_interview(db, interview_id)
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found — has this interview been finished yet?",
        )

    return ReportOut(
        id=report.id,
        interview_id=report.interview_id,
        status=report.status,
        neuroscore=report.neuroscore,
        radar=report.radar or [],
        breakdown=report.breakdown or {},
        feedback=report.feedback or {},
        created_at=report.created_at,
    )
