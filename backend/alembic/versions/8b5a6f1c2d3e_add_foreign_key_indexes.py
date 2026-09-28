"""Add indexes for common foreign-key lookups.

Revision ID: 8b5a6f1c2d3e
Revises: 6128d4a0b9a2
"""
from typing import Sequence, Union

from alembic import op


revision: str = "8b5a6f1c2d3e"
down_revision: Union[str, Sequence[str], None] = "6128d4a0b9a2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index("ix_assessments_competency_id", "assessments", ["competency_id"])
    op.create_index("ix_assessment_attempts_assessment_id", "assessment_attempts", ["assessment_id"])
    op.create_index("ix_assessment_attempts_official_id", "assessment_attempts", ["official_id"])
    op.create_index("ix_learning_history_official_id", "learning_history", ["official_id"])
    op.create_index("ix_officials_role_id", "officials", ["role_id"])
    op.create_index("ix_questions_assessment_id", "questions", ["assessment_id"])
    op.create_index("ix_question_options_question_id", "question_options", ["question_id"])
    op.create_index("ix_course_competencies_competency_id", "course_competencies", ["competency_id"])
    op.create_index("ix_training_competencies_competency_id", "training_competencies", ["competency_id"])


def downgrade() -> None:
    op.drop_index("ix_training_competencies_competency_id", table_name="training_competencies")
    op.drop_index("ix_course_competencies_competency_id", table_name="course_competencies")
    op.drop_index("ix_question_options_question_id", table_name="question_options")
    op.drop_index("ix_questions_assessment_id", table_name="questions")
    op.drop_index("ix_officials_role_id", table_name="officials")
    op.drop_index("ix_learning_history_official_id", table_name="learning_history")
    op.drop_index("ix_assessment_attempts_official_id", table_name="assessment_attempts")
    op.drop_index("ix_assessment_attempts_assessment_id", table_name="assessment_attempts")
    op.drop_index("ix_assessments_competency_id", table_name="assessments")
