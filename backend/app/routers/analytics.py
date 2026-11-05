import datetime
import logging
from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy import Date, cast, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ChatLog, DocumentChunk, DocumentSource

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/", response_model=Dict[str, Any])
def get_analytics(db: Session = Depends(get_db)):
    """
    Comprehensive real-time analytics for the admin telemetry dashboard:
    - total_queries: Total number of queries submitted by users
    - total_sources: Total document and URL sources indexed
    - total_chunks: Total 768-dim vector chunks in NeonDB
    - pdf_sources: Number of PDF sources
    - url_sources: Number of URL sources
    - avg_sources_cited: Average number of sources cited per response
    - avg_chunks_per_source: Average chunks produced per source
    - chart_data: Daily query volume & citations for the past 7 days
    - source_distribution: Chunks & sources grouped by type for composition charts
    - recent_queries: The 10 most recent query logs with timestamps and citations
    - system_info: Core AI models and vector dimensions
    """
    try:
        total_queries = db.query(ChatLog).count()
        total_sources = db.query(DocumentSource).count()
        total_chunks = db.query(DocumentChunk).count()

        # Breakdown by source type
        pdf_sources = (
            db.query(DocumentSource)
            .filter(DocumentSource.source_type == "pdf")
            .count()
        )
        url_sources = (
            db.query(DocumentSource)
            .filter(DocumentSource.source_type == "url")
            .count()
        )

        # Average sources cited per query
        avg_cited_raw = db.query(func.avg(ChatLog.sources_cited)).scalar()
        avg_sources_cited = round(float(avg_cited_raw), 1) if avg_cited_raw is not None else 0.0

        # Average chunks per source
        avg_chunks_per_source = (
            round(total_chunks / total_sources, 1) if total_sources > 0 else 0.0
        )

        # 7-day query volume and citations
        today = datetime.date.today()
        seven_days_ago = today - datetime.timedelta(days=6)

        daily_stats = (
            db.query(
                cast(ChatLog.created_at, Date).label("day"),
                func.count(ChatLog.id).label("query_count"),
                func.coalesce(func.sum(ChatLog.sources_cited), 0).label("citations_count"),
            )
            .filter(cast(ChatLog.created_at, Date) >= seven_days_ago)
            .group_by(cast(ChatLog.created_at, Date))
            .all()
        )

        daily_lookup = {
            row.day: {"queries": row.query_count, "citations": row.citations_count}
            for row in daily_stats
        }

        chart_data = []
        for i in range(7):
            current_day = seven_days_ago + datetime.timedelta(days=i)
            day_data = daily_lookup.get(current_day, {"queries": 0, "citations": 0})
            chart_data.append({
                "date": current_day.strftime("%a"),
                "full_date": current_day.strftime("%b %d, %Y"),
                "queries": day_data["queries"],
                "citations": day_data["citations"],
            })

        # Breakdown of chunks by source type for composition charts
        type_chunk_stats = (
            db.query(
                DocumentSource.source_type,
                func.count(func.distinct(DocumentSource.id)).label("source_count"),
                func.count(DocumentChunk.id).label("chunk_count"),
            )
            .outerjoin(DocumentChunk, DocumentSource.id == DocumentChunk.source_id)
            .group_by(DocumentSource.source_type)
            .all()
        )

        source_distribution = []
        for row in type_chunk_stats:
            source_distribution.append({
                "name": "PDFs" if row.source_type.lower() == "pdf" else "Web URLs",
                "type": row.source_type.upper(),
                "sources": row.source_count,
                "chunks": row.chunk_count,
            })

        # Ensure both types exist in the distribution if not present
        existing_types = {d["type"] for d in source_distribution}
        if "PDF" not in existing_types:
            source_distribution.append({"name": "PDFs", "type": "PDF", "sources": 0, "chunks": 0})
        if "URL" not in existing_types:
            source_distribution.append({"name": "Web URLs", "type": "URL", "sources": 0, "chunks": 0})

        # 10 Most recent queries
        recent_logs = (
            db.query(ChatLog)
            .order_by(ChatLog.created_at.desc())
            .limit(10)
            .all()
        )

        recent_queries = [
            {
                "id": log.id,
                "message": log.message,
                "sources_cited": log.sources_cited,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            }
            for log in recent_logs
        ]

        return {
            "total_queries": total_queries,
            "total_sources": total_sources,
            "total_chunks": total_chunks,
            "pdf_sources": pdf_sources,
            "url_sources": url_sources,
            "avg_sources_cited": avg_sources_cited,
            "avg_chunks_per_source": avg_chunks_per_source,
            "chart_data": chart_data,
            "source_distribution": source_distribution,
            "recent_queries": recent_queries,
            "system_info": {
                "embedding_model": "gemini-embedding-001",
                "embedding_dimensions": 768,
                "generation_model": "gemini-2.5-flash",
                "vector_db": "NeonDB PostgreSQL (pgvector)",
            },
        }

    except Exception as exc:
        logger.error(f"Error fetching analytics data: {exc}", exc_info=True)
        return {
            "total_queries": 0,
            "total_sources": 0,
            "total_chunks": 0,
            "pdf_sources": 0,
            "url_sources": 0,
            "avg_sources_cited": 0.0,
            "avg_chunks_per_source": 0.0,
            "chart_data": [],
            "source_distribution": [],
            "recent_queries": [],
            "system_info": {},
        }


# Alias for explicit imports
analytics_router = router
