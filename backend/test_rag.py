from app.services.retrieval_service import search_rag, build_context
from app.services.llm_service import generate_answer

question = "How does SkillIntel calculate competency gaps?"

results = search_rag(question, top_k=3)
context = build_context(results)

answer = generate_answer(question, context)

print("\n=== ANSWER ===\n")
print(answer)