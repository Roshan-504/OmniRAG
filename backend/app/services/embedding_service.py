import logging
import time
from typing import List
from google import genai
from google.genai import types
from app.config import settings

logger = logging.getLogger(__name__)

# Initialize Google GenAI client (NEW google.genai SDK)
client = genai.Client(api_key=settings.GEMINI_API_KEY)

EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSIONS = 768


def generate_embeddings(
    texts: List[str],
    batch_size: int = 50,
    max_retries: int = 3,
) -> List[List[float]]:
    """
    Generate 768-dimensional embeddings for documents (KB chunks)
    using gemini-embedding-001 with task_type='RETRIEVAL_DOCUMENT'.
    """
    if not texts:
        return []

    cleaned_texts = [t.strip() if t and t.strip() else " " for t in texts]
    all_embeddings: List[List[float]] = []

    for i in range(0, len(cleaned_texts), batch_size):
        batch = cleaned_texts[i : i + batch_size]
        attempts = 0
        success = False

        while not success and attempts < max_retries:
            try:
                attempts += 1
                response = client.models.embed_content(
                    model=EMBEDDING_MODEL,
                    contents=batch,
                    config=types.EmbedContentConfig(
                        task_type="RETRIEVAL_DOCUMENT",
                        output_dimensionality=EMBEDDING_DIMENSIONS,
                    ),
                )
                batch_vectors = [list(e.values) for e in response.embeddings]
                all_embeddings.extend(batch_vectors)
                success = True
            except Exception as exc:
                logger.warning(
                    f"Batch embedding attempt {attempts}/{max_retries} failed: {exc}"
                )
                if attempts >= max_retries:
                    # Fallback to single-item calls if batch request fails
                    logger.info("Attempting per-chunk embedding fallback...")
                    for single_text in batch:
                        single_response = client.models.embed_content(
                            model=EMBEDDING_MODEL,
                            contents=single_text,
                            config=types.EmbedContentConfig(
                                task_type="RETRIEVAL_DOCUMENT",
                                output_dimensionality=EMBEDDING_DIMENSIONS,
                            ),
                        )
                        all_embeddings.append(list(single_response.embeddings[0].values))
                    success = True
                else:
                    time.sleep(2 ** attempts)

    return all_embeddings


def generate_query_embedding(
    text: str,
    max_retries: int = 3,
) -> List[float]:
    """
    Generate 768-dimensional embedding for search query
    using gemini-embedding-001 with task_type='RETRIEVAL_QUERY'.
    """
    cleaned_text = text.strip()
    if not cleaned_text:
        return [0.0] * EMBEDDING_DIMENSIONS

    attempts = 0
    while attempts < max_retries:
        try:
            attempts += 1
            response = client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=cleaned_text,
                config=types.EmbedContentConfig(
                    task_type="RETRIEVAL_QUERY",
                    output_dimensionality=EMBEDDING_DIMENSIONS,
                ),
            )
            return list(response.embeddings[0].values)
        except Exception as exc:
            logger.warning(
                f"Query embedding attempt {attempts}/{max_retries} failed: {exc}"
            )
            if attempts >= max_retries:
                logger.error(
                    f"Failed to generate query embedding after {max_retries} attempts: {exc}"
                )
                raise
            time.sleep(2 ** attempts)

    return [0.0] * EMBEDDING_DIMENSIONS
