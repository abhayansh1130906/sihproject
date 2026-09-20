from sqlalchemy import Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TrainingProgramme(Base):
    __tablename__ = "training_programmes"

    training_id: Mapped[str] = mapped_column(
        String(20),
        primary_key=True
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    target_audience: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False
    )

    topic: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    duration: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    year: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    provider: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    source_document: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    source_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )