from datetime import datetime

from pydantic import BaseModel


class AssessmentResponse(BaseModel):
    assessment_id: str
    title: str
    description: str
    competency_id: str
    source_type: str
    source_reference: str | None
    question_count: int
    passing_score: int
    created_at: datetime