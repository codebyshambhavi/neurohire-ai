"""
Dashboard aggregation.

Everything here is computed from real rows in the database. Interviews whose
Report is still `pending` (i.e. NeuroCore fusion hasn't run yet — expected
for all interviews until Phase 6 ships) are excluded from score-based views
rather than backfilled with placeholder numbers. This keeps the dashboard
honest: an empty state is correct output for a fresh Phase 1 deployment,
not a bug.
"""
from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.interview import Interview
from app.models.report import Report, ReportStatus
from app.schemas.dashboard import (
    DashboardStat,
    DashboardSummaryOut,
    PerformancePoint,
    RecentInterview,
    Recommendation,
    SkillBreakdownItem,
)


def _ready_interviews_with_reports(db: Session, user_id: str) -> list[tuple[Interview, Report]]:
    stmt = (
        select(Interview, Report)
        .join(Report, Report.interview_id == Interview.id)
        .where(Interview.user_id == user_id, Report.status == ReportStatus.READY)
        .order_by(Interview.completed_at.desc())
    )
    return list(db.execute(stmt).all())  # type: ignore[return-value]


def build_dashboard_summary(db: Session, user_id: str) -> DashboardSummaryOut:
    total_count = len(list(db.scalars(select(Interview.id).where(Interview.user_id == user_id))))

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_count = len(
        list(
            db.scalars(
                select(Interview.id).where(
                    Interview.user_id == user_id, Interview.created_at >= thirty_days_ago
                )
            )
        )
    )

    scored = _ready_interviews_with_reports(db, user_id)

    avg_score = round(sum(r.neuroscore or 0 for _, r in scored) / len(scored)) if scored else None
    improvement = None
    if len(scored) >= 2:
        newest, oldest = scored[0][1].neuroscore, scored[-1][1].neuroscore
        if newest is not None and oldest is not None:
            improvement = newest - oldest

    stats = [
        DashboardStat(
            label="Total Interviews",
            value=str(total_count),
            delta=f"+{recent_count} this month",
            trend="up",
        ),
        DashboardStat(
            label="Average Score",
            value=str(avg_score) if avg_score is not None else "--",
            delta="Across analyzed interviews" if scored else "No analyzed interviews yet",
            trend="up",
        ),
        DashboardStat(
            label="Improvement",
            value=f"{improvement:+d}" if improvement is not None else "--",
            delta="First vs. most recent scored session",
            trend="up" if (improvement or 0) >= 0 else "down",
        ),
        DashboardStat(
            label="Practice Time",
            value="0h",
            delta="Session duration tracking not yet implemented",
            trend="up",
        ),
    ]

    performance: list[PerformancePoint] = []
    for interview, report in reversed(scored):
        if report.neuroscore is None:
            continue
        month_label = (interview.completed_at or interview.created_at).strftime("%b")
        communication = report.neuroscore
        if report.breakdown and report.breakdown.get("speechiq"):
            speech_values = [m["value"] for m in report.breakdown["speechiq"]]
            communication = round(sum(speech_values) / len(speech_values))
        performance.append(
            PerformancePoint(month=month_label, score=report.neuroscore, communication=communication)
        )

    skill_totals: dict[str, list[int]] = defaultdict(list)
    for _, report in scored:
        for metric in report.radar or []:
            skill_totals[metric["metric"]].append(metric["value"])
    skill_breakdown = [
        SkillBreakdownItem(skill=skill, value=round(sum(values) / len(values)))
        for skill, values in skill_totals.items()
    ]

    def _format_date(dt: datetime) -> str:
        return f"{dt.strftime('%b')} {dt.day}, {dt.year}"

    recent_interviews = [
        RecentInterview(
            id=interview.id,
            role=interview.role_label,
            date=_format_date(interview.completed_at or interview.created_at),
            difficulty=interview.difficulty_label,  # type: ignore[arg-type]
            score=report.neuroscore or 0,
            improvement=0,
        )
        for interview, report in scored[:5]
    ]

    # Recommendations come from the most recent ready report's tagged feedback,
    # if present. No tagged feedback exists yet in Phase 1 (NeuroCore hasn't
    # run), so this is correctly empty until Phase 6.
    recommendations: list[Recommendation] = []
    if scored:
        latest_feedback = scored[0][1].feedback or {}
        for item in latest_feedback.get("tagged_recommendations", []):
            recommendations.append(Recommendation(**item))

    return DashboardSummaryOut(
        stats=stats,
        performance=performance,
        skill_breakdown=skill_breakdown,
        recent_interviews=recent_interviews,
        recommendations=recommendations,
    )
