from pathlib import Path
import json

from sentence_transformers import util
from app.services.embedding_service import get_embedding_model


CORPUS_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "rag_corpus.json"
)

_CORPUS = None
_CORPUS_EMBEDDINGS = None


def load_rag_corpus() -> list[dict]:
    with open(CORPUS_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def get_corpus() -> list[dict]:
    global _CORPUS
    if _CORPUS is None:
        _CORPUS = load_rag_corpus()
    return _CORPUS


def get_corpus_embeddings():
    global _CORPUS_EMBEDDINGS
    if _CORPUS_EMBEDDINGS is None:
        model = get_embedding_model()
        corpus = get_corpus()
        documents = [
            f"{document['title']}\n{document['content']}"
            for document in corpus
        ]
        _CORPUS_EMBEDDINGS = model.encode(
            documents,
            convert_to_tensor=True,
        )
    return _CORPUS_EMBEDDINGS



def search_rag(
    query: str,
    top_k: int = 3,
) -> list[dict]:
    model = get_embedding_model()
    corpus = get_corpus()
    corpus_embeddings = get_corpus_embeddings()

    query_embedding = model.encode(
        query,
        convert_to_tensor=True,
    )

    similarities = util.cos_sim(
        query_embedding,
        corpus_embeddings,
    )[0]

    ranked_indices = similarities.argsort(
        descending=True
    )[:top_k]

    results = []

    for index in ranked_indices:
        document = corpus[index]

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