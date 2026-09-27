from functools import lru_cache
from groq import Groq

from app.core.config import settings

MODEL_NAME = "openai/gpt-oss-120b"


@lru_cache
def get_client() -> Groq:
    return Groq(api_key=settings.groq_api_key)


def generate_answer(question: str, context: str) -> str:
    response = get_client().chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are SkillIntel, an AI learning assistant for "
                    "India's Official Statistical System. "
                    "Answer questions using the provided context. "
                    "If the context does not contain enough information, "
                    "say so instead of inventing facts."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Context:\n{context}\n\n"
                    f"Question:\n{question}"
                ),
            },
        ],
    )

    return response.choices[0].message.content