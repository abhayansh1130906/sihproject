from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CourseCompetency(Base):
    __tablename__ = "course_competencies"

    course_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("courses.course_id"),
        primary_key=True
    )

    competency_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("competencies.competency_id"),
        primary_key=True
    )

    mapping_basis: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )