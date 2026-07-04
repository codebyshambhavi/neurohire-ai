from functools import lru_cache
from typing import Protocol, cast

import numpy as np
from numpy.typing import NDArray


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


class EmbeddingModel(Protocol):
    def encode(
        self,
        sentences: list[str],
        *,
        normalize_embeddings: bool,
        show_progress_bar: bool,
    ) -> NDArray[np.float32]: ...


@lru_cache(maxsize=1)
def get_embedding_model() -> EmbeddingModel:
    from sentence_transformers import SentenceTransformer

    return cast(EmbeddingModel, SentenceTransformer(MODEL_NAME))


def semantic_similarity(question: str, answer: str) -> float:
    embeddings = get_embedding_model().encode(
        [question, answer],
        normalize_embeddings=True,
        show_progress_bar=False,
    )
    similarity = float(np.dot(embeddings[0], embeddings[1]))
    return max(0.0, min(1.0, similarity))
