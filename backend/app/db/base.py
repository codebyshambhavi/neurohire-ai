"""
Declarative base and shared mixins for all ORM models.
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Shared declarative base. All models inherit from this."""
    pass


def generate_uuid() -> str:
    """String UUIDs keep primary keys portable across SQLite and Postgres."""
    return uuid.uuid4().hex


class UUIDPrimaryKeyMixin:
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_uuid)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
