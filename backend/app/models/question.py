from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Question(Base):
    __tablename__ = "questions"

    question_id: Mapped[str] = mapped_column(
        String(20),
        primary_key=True
    )

    assessment_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("assessments.assessment_id"),
        nullable=False
    )

    question_text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    explanation: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    question_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    marks: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False
    )