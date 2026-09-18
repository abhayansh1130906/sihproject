from pydantic import BaseModel


class CompetencyResponse(BaseModel):
    competency_id: str
    name: str
    domain: str
    competency_type: str
    description: str
    source_type: str
    source: str
    source_document: str
    source_url: str | None