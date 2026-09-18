from pydantic import BaseModel


class TrainingProgrammeResponse(BaseModel):
    training_id: str
    title: str
    category: str
    target_audience: list[str]
    topic: str
    duration: int | None
    year: int | None
    provider: str
    source_document: str
    source_url: str | None