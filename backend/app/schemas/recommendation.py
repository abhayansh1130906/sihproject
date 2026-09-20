from pydantic import BaseModel


class RecommendationResponse(BaseModel):
    resource_id: str
    resource_type: str
    title: str
    competency_id: str
    competency_name: str
    gap: int
    reason: str
    source_url: str | None