from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TrainingCompetency(Base):
    __tablename__ = "training_competencies"

    training_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("training_programmes.training_id"),
        primary_key=True
    )

    competency_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("competencies.competency_id"),
        primary_key=True
    )

    relevance: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )