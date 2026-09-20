from pathlib import Path
import json

from sentence_transformers import SentenceTransformer, util


MODEL_NAME = "all-MiniLM-L6-v2"

model = SentenceTransformer(MODEL_NAME)

CORPUS_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "rag_corpus.json"
)


def load_rag_corpus() -> list[dict]:
    with open(CORPUS_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def build_corpus_embeddings(
    corpus: list[dict],
) -> list[list[float]]:

    documents = [
        f"{document['title']}\n{document['content']}"
        for document in corpus
    ]

    embeddings = model.encode(
        documents,
        convert_to_tensor=True,
    )

    return embeddings


CORPUS = load_rag_corpus()
CORPUS_EMBEDDINGS = build_corpus_embeddings(CORPUS)


def search_rag(
    query: str,
    top_k: int = 3,
) -> list[dict]:

    query_embedding = model.encode(
        query,
        convert_to_tensor=True,
    )

    similarities = util.cos_sim(
        query_embedding,
        CORPUS_EMBEDDINGS,
    )[0]

    ranked_indices = similarities.argsort(
        descending=True
    )[:top_k]

    results = []

    for index in ranked_indices:
        document = CORPUS[index]

        results.append(
            {
                **document,
                "similarity": similarities[index].item(),
            }
        )

    return results

def build_context(
    results: list[dict],
) -> str:

    context_parts = []

    for result in results:
        context_parts.append(
            f"[{result['title']}]\n"
            f"{result['content']}"
        )

    return "\n\n".join(context_parts)