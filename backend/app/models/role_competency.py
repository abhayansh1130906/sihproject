from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class RoleCompetency(Base):
    __tablename__ = "role_competencies"

    role_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("roles.role_id"),
        primary_key=True
    )

    competency_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("competencies.competency_id"),
        primary_key=True
    )

    required_level: Mapped[int] = mapped_column(
        nullable=False
    )

    mapping_basis: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )