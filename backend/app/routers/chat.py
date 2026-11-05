import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ChatLog
from app.schemas import ChatRequest, ChatResponse, RetrievedChunk, SourceDetail
from app.services.embedding_service import generate_query_embedding
from app.services.rag_service import generate_rag_response
from app.services.vector_search_service import find_similar_chunks

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("/", response_model=ChatResponse, status_code=status.HTTP_200_OK)
def chat_endpoint(
    request: ChatRequest,
    db: Session = Depends(get_db),
):
    """
    RAG conversational query endpoint:
    1. Embeds the user query via Gemini gemini-embedding-001 (RETRIEVAL_QUERY).
    2. Performs pgvector cosine similarity search to retrieve top_k relevant chunks.
    3. Grounded generation via Gemini 2.5 Flash using retrieved context.
    4. Returns synthesized answer, cited sources, and raw chunks for transparency.
    """
    query_text = request.message.strip()
    if not query_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The 'message' field cannot be empty.",
        )

    try:
        # Step 1: Embed the user's search query
        logger.info(f"Generating query embedding for: '{query_text[:50]}...'")
        query_embedding = generate_query_embedding(query_text)
        if not query_embedding or len(query_embedding) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate query embedding.",
            )

        # Step 2: Retrieve similar chunks from NeonDB pgvector
        logger.info(f"Retrieving top {request.top_k} similar chunks...")
        similar_chunks = find_similar_chunks(
            db=db,
            query_embedding=query_embedding,
            top_k=request.top_k,
        )

        # Step 3: Generate the RAG answer via Gemini 2.5 Flash
        logger.info("Generating grounded response via rag_service with conversation history...")
        rag_output = generate_rag_response(
            query=query_text,
            contexts=similar_chunks,
            history=request.history,
        )

        # Step 4: Construct and return structured ChatResponse
        source_details = [
            SourceDetail(name=s["name"], type=s["type"])
            for s in rag_output.get("sources", [])
        ]

        retrieved_chunk_objects = [
            RetrievedChunk(
                content=chunk["content"],
                source=chunk["source_name"],
                score=chunk["score"],
            )
            for chunk in similar_chunks
        ]

        # Step 5: Log interaction metrics into database
        unique_sources = rag_output.get("sources", [])
        log_entry = ChatLog(
            message=request.message,
            sources_cited=len(unique_sources),
        )
        db.add(log_entry)
        db.commit()

        return ChatResponse(
            answer=rag_output.get("answer", ""),
            sources=source_details,
            retrieved_chunks=retrieved_chunk_objects,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error handling chat request: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating the chat response: {str(exc)}",
        )


# Alias for clean module exports
chat_router = router
