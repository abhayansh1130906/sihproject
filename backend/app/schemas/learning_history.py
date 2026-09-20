from datetime import date

from pydantic import BaseModel


class LearningHistoryCreateRequest(BaseModel):
    learning_type: str
    resource_id: str
    resource_title: str
    status: str
    completion_date: date | None = None
    score: int | None = None
    source_type: str


class LearningHistoryResponse(BaseModel):
    history_id: str
    learning_type: str
    resource_id: str
    resource_title: str
    status: str
    completion_date: date | None
    score: int | None
    source_type: str