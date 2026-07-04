"""
Import every model here so `Base.metadata` sees the full schema in one place --
required for `Base.metadata.create_all()` in dev and for Alembic autogenerate.
"""
from app.models.answer import Answer  # noqa: F401
from app.models.interview import Interview  # noqa: F401
from app.models.question import Question  # noqa: F401
from app.models.report import Report  # noqa: F401
from app.models.user import User  # noqa: F401

__all__ = ["User", "Interview", "Question", "Answer", "Report"]
