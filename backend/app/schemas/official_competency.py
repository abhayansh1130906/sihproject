from pydantic import BaseModel


class OfficialCompetencyResponse(BaseModel):
    competency_id: str
    competency_name: str
    domain: str
    current_level: int
    assessment_source: str