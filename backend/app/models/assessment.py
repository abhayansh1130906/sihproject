from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Assessment(Base):
    __tablename__ = "assessments"

    assessment_id: Mapped[str] = mapped_column(
        String(20),
        primary_key=True
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    competency_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("competencies.competency_id"),
        nullable=False
    )

    source_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    source_reference: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    question_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    passing_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )