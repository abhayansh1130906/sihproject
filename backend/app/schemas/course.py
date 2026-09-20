from pydantic import BaseModel


class CourseResponse(BaseModel):
    course_id: str
    title: str
    description: str
    provider: str
    duration_minutes: int | None
    tags: list[str]
    target_audience: list[str]
    learning_outcomes: list[str]
    course_type: str
    source_url: str | None
    catalogue_source: str
    verification_status: str