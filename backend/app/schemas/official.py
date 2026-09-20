from pydantic import BaseModel


class OfficialResponse(BaseModel):
    official_id: str
    role_id: str
    name: str
    designation: str
    department: str
    division: str
    current_assignment: str
    education: str
    experience_years: int
    previous_trainings: list[str]