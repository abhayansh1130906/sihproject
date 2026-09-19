import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

client = Groq(api_key=api_key)

MODEL_NAME = "openai/gpt-oss-120b"


def generate_answer(question: str, context: str) -> str:
    response = client.chat.completions.create(
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