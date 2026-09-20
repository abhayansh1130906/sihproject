from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    attempt_id: Mapped[str] = mapped_column(
        String(20),
        primary_key=True
    )

    assessment_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("assessments.assessment_id"),
        nullable=False
    )

    official_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("officials.official_id"),
        nullable=False
    )

    score: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    passed: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )