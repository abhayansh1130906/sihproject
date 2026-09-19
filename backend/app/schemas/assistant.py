from pydantic import BaseModel


class AssistantChatRequest(BaseModel):
    question: str


class AssistantSource(BaseModel):
    document_id: str
    title: str
    source: str
    similarity: float


class AssistantChatResponse(BaseModel):
    answer: str
    sources: list[AssistantSource]