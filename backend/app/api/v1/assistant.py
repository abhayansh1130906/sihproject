from fastapi import APIRouter

from app.schemas.assistant import (
    AssistantChatRequest,
    AssistantChatResponse,
    AssistantSource,
)
from app.services.llm_service import generate_answer
from app.services.retrieval_service import build_context, search_rag


router = APIRouter(
    prefix="/api/v1/assistant",
    tags=["Assistant"],
)


@router.post("/chat", response_model=AssistantChatResponse)
def chat(request: AssistantChatRequest):
    results = search_rag(request.question, top_k=3)

    context = build_context(results)

    answer = generate_answer(
        question=request.question,
        context=context,
    )

    sources = [
        AssistantSource(
            document_id=result["document_id"],
            title=result["title"],
            source=result["source"],
            similarity=result["similarity"],
        )
        for result in results
    ]

    return AssistantChatResponse(
        answer=answer,
        sources=sources,
    )