from app.services.llm_service import client

response = client.chat.completions.create(
    model="openai/gpt-oss-120b",
    messages=[
        {
            "role": "user",
            "content": "Say hello from SkillIntel in one sentence."
        }
    ],
)

print(response.choices[0].message.content)