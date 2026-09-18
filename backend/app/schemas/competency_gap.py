from pydantic import BaseModel


class CompetencyGapResponse(BaseModel):
    competency_id: str
    competency_name: str
    domain: str
    required_level: int
    current_level: int
    gap: int
    gap_status: str