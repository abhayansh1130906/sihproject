from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class Competency(Base):

    __tablename__ = "competencies"

    competency_id: Mapped[str] = mapped_column(
        String(20),
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    domain: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    competency_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    source_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    source: Mapped[str] = mapped_column(
        String(100),
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