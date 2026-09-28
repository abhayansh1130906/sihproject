import json
import re
from pathlib import Path

CORPUS_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "rag_corpus.json"
)

_CORPUS = None
_TOKEN_RE = re.compile(r"[a-z0-9]+")


def load_rag_corpus() -> list[dict]:
    with open(CORPUS_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def get_corpus() -> list[dict]:
    global _CORPUS
    if _CORPUS is None:
        _CORPUS = load_rag_corpus()
    return _CORPUS


def reload_corpus() -> int:
    """Force a reload of the RAG corpus from disk, discarding the cached copy.

    Returns the number of documents loaded.
    """
    global _CORPUS
    _CORPUS = load_rag_corpus()
    return len(_CORPUS)


def search_rag(
    query: str,
    top_k: int = 3,
) -> list[dict]:
    corpus = get_corpus()
    query_tokens = set(_TOKEN_RE.findall(query.lower()))

    ranked = []
    for index, document in enumerate(corpus):
        document_text = f"{document['title']} {document['content']}".lower()
        document_tokens = set(_TOKEN_RE.findall(document_text))
        similarity = (
            len(query_tokens & document_tokens) / len(query_tokens)
            if query_tokens
            else 0.0
        )
        ranked.append((similarity, -index, document))

    ranked.sort(reverse=True)
    return [
        {**document, "similarity": similarity}
        for similarity, _, document in ranked[:max(1, top_k)]
    ]


def build_context(results: list[dict]) -> str:
    return "\n\n".join(
        f"[{result['title']}]\n{result['content']}" for result in results
    )