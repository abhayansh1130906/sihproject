from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Course(Base):
    __tablename__ = "courses"

    course_id: Mapped[str] = mapped_column(
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

    provider: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    duration_minutes: Mapped[int | None] = mapped_column(
        nullable=True
    )

    tags: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False
    )

    target_audience: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False
    )

    learning_outcomes: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False
    )

    course_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    source_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    catalogue_source: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    verification_status: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )