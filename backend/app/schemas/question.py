from pydantic import BaseModel


class QuestionOptionResponse(BaseModel):
    option_id: str
    option_text: str


class QuestionResponse(BaseModel):
    question_id: str
    question_text: str
    explanation: str
    question_type: str
    marks: int
    options: list[QuestionOptionResponse]