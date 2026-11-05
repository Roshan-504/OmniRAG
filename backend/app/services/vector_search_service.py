import logging
from typing import Any, Dict, List
from sqlalchemy.orm import Session

from app.models import DocumentChunk, DocumentSource

logger = logging.getLogger(__name__)


def find_similar_chunks(
    db: Session,
    query_embedding: List[float],
    top_k: int = 3,
) -> List[Dict[str, Any]]:
    """
    Performs cosine similarity search using pgvector on DocumentChunk embeddings.
    Orders by cosine distance ascending and returns top_k relevant text chunks
    along with source metadata and similarity score (1.0 - distance).
    """
    if not query_embedding:
        return []

    try:
        # Calculate cosine distance via pgvector's cosine_distance operator (<=>)
        distance = DocumentChunk.embedding.cosine_distance(query_embedding).label("distance")

        results = (
            db.query(DocumentChunk, DocumentSource, distance)
            .join(DocumentSource, DocumentChunk.source_id == DocumentSource.id)
            .filter(DocumentChunk.embedding.isnot(None))
            .order_by(distance.asc())
            .limit(top_k)
            .all()
        )

        matched_chunks: List[Dict[str, Any]] = []
        for chunk, source, dist in results:
            # Similarity score: 1.0 - distance
            calculated_score = 1.0 - float(dist) if dist is not None else 0.0
            matched_chunks.append({
                "content": chunk.content,
                "source_name": source.name_or_url,
                "source_type": source.source_type,
                "score": round(calculated_score, 4),
            })

        logger.info(f"Retrieved {len(matched_chunks)} similar chunks for query embedding.")
        return matched_chunks

    except Exception as exc:
        logger.error(f"Error querying similar chunks: {exc}", exc_info=True)
        raise

