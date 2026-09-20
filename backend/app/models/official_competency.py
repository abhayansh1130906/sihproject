from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class OfficialCompetency(Base):
    __tablename__ = "official_competencies"

    official_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("officials.official_id"),
        primary_key=True
    )

    competency_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("competencies.competency_id"),
        primary_key=True
    )

    current_level: Mapped[int] = mapped_column(
        nullable=False
    )

    assessment_source: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )