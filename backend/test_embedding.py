from app.services.retrieval_service import (
    search_rag,
    build_context,
)


query = "What are the responsibilities of DIID?"

results = search_rag(query, top_k=2)

context = build_context(results)

print("\n=== RETRIEVED CONTEXT ===\n")
print(context)