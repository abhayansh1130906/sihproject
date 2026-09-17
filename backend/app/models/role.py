from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class Role(Base):
    __tablename__ = "roles"

    role_id: Mapped[str] = mapped_column(
        String(20),
        primary_key=True
    )

    role_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    role_type: Mapped[str] = mapped_column(
        String(100),
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

    responsibilities: Mapped[list[str]] = mapped_column(
        JSONB,
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