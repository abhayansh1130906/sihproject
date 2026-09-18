from datetime import datetime

from pydantic import BaseModel


class AssessmentAttemptRequest(BaseModel):
    official_id: str
    answers: dict[str, str]


class AssessmentAttemptResponse(BaseModel):
    attempt_id: str
    assessment_id: str
    official_id: str
    score: int
    passed: bool
    started_at: datetime
    completed_at: datetime | None