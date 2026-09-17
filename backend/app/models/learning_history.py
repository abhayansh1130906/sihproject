from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class LearningHistory(Base):
    __tablename__ = "learning_history"

    history_id: Mapped[str] = mapped_column(
        String(20),
        primary_key=True
    )

    official_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("officials.official_id"),
        nullable=False
    )

    learning_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    resource_id: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    resource_title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    completion_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    score: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    source_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )