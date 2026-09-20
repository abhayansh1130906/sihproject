from pydantic import BaseModel


class DemoLoginRequest(BaseModel):
    official_id: str
    password: str


class DemoLoginResponse(BaseModel):
    official_id: str
    name: str
    designation: str
    department: str
    role_id: str
    demo_mode: bool