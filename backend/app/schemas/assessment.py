from datetime import datetime
from pydantic import BaseModel, Field


class QuestionOptionCreateRequest(BaseModel):
    option_text: str
    is_correct: bool


class QuestionCreateRequest(BaseModel):
    question_text: str
    explanation: str = ""
    question_type: str = "MULTIPLE_CHOICE"
    marks: int = 1
    options: list[QuestionOptionCreateRequest]


class AssessmentCreateRequest(BaseModel):
    title: str
    description: str
    competency_id: str
    source_type: str = "MANUAL_UPLOAD"
    source_reference: str | None = None
    passing_score: int = 70
    questions: list[QuestionCreateRequest]


class GenerateQuizRequest(BaseModel):
    competency_id: str
    topic: str | None = None
    num_questions: int = Field(default=5, ge=1, le=15)
    difficulty: str = Field(default="Intermediate")
    study_material: str | None = None


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