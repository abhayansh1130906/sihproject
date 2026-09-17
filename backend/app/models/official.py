from sqlalchemy import Integer, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Official(Base):
    __tablename__ = "officials"

    official_id: Mapped[str] = mapped_column(
        String(20),
        primary_key=True
    )
    role_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("roles.role_id"),
        nullable=False
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    designation: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    department: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    division: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    current_assignment: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    education: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    experience_years: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    previous_trainings: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False
    )