from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class QuestionOption(Base):
    __tablename__ = "question_options"

    option_id: Mapped[str] = mapped_column(
        String(20),
        primary_key=True
    )

    question_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("questions.question_id"),
        nullable=False
    )

    option_text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    is_correct: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False
    )