import logging
from typing import List
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import DocumentChunk, DocumentSource
from app.schemas import (
    IngestResponse,
    MessageResponse,
    SourceResponse,
    URLIngestRequest,
)
from app.services.chunking_service import chunk_text
from app.services.embedding_service import generate_embeddings
from app.services.parser_service import extract_text_from_pdf, extract_text_from_url

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ingest", tags=["Ingestion"])


@router.post("/pdf", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Ingest a PDF file: extracts text, chunks the content, computes 768-dim
    embeddings via Gemini, and persists the source and chunks in NeonDB.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid PDF document (.pdf extension).",
        )

    try:
        file_bytes = await file.read()
        extracted_text = extract_text_from_pdf(file_bytes)
        chunks = chunk_text(extracted_text)

        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Extracted PDF content did not yield any usable chunks.",
            )

        logger.info(
            f"Generating embeddings for {len(chunks)} chunks from PDF '{file.filename}'..."
        )
        embeddings = generate_embeddings(chunks)

        # Create parent DocumentSource
        source = DocumentSource(
            source_type="pdf",
            name_or_url=file.filename,
        )
        db.add(source)
        db.commit()
        db.refresh(source)

        # Batch insert chunks using db.add_all to minimize network overhead with NeonDB
        chunk_objects = [
            DocumentChunk(
                source_id=source.id,
                content=chunk_content,
                chunk_index=idx,
                embedding=embedding_vector,
            )
            for idx, (chunk_content, embedding_vector) in enumerate(zip(chunks, embeddings))
        ]
        db.add_all(chunk_objects)
        db.commit()

        logger.info(
            f"Successfully ingested PDF '{file.filename}' as source ID {source.id} with {len(chunk_objects)} chunks."
        )

        return IngestResponse(
            message="PDF ingested and indexed successfully.",
            source_id=source.id,
            name_or_url=source.name_or_url,
            chunk_count=len(chunk_objects),
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        logger.error(f"Error during PDF ingestion: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing the PDF: {str(exc)}",
        )


@router.post("/url", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
def ingest_url(
    payload: URLIngestRequest,
    db: Session = Depends(get_db),
):
    """
    Ingest web page content from a URL: scrapes plaintext, splits into chunks,
    generates 768-dim vector embeddings, and stores them in NeonDB.
    """
    url = payload.url.strip()
    if not url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL field cannot be empty.",
        )

    try:
        extracted_text = extract_text_from_url(url)
        chunks = chunk_text(extracted_text)

        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Extracted web page content did not yield any usable chunks.",
            )

        logger.info(
            f"Generating embeddings for {len(chunks)} chunks from URL '{url}'..."
        )
        embeddings = generate_embeddings(chunks)

        # Create parent DocumentSource
        source = DocumentSource(
            source_type="url",
            name_or_url=url,
        )
        db.add(source)
        db.commit()
        db.refresh(source)

        # Batch insert chunks using db.add_all
        chunk_objects = [
            DocumentChunk(
                source_id=source.id,
                content=chunk_content,
                chunk_index=idx,
                embedding=embedding_vector,
            )
            for idx, (chunk_content, embedding_vector) in enumerate(zip(chunks, embeddings))
        ]
        db.add_all(chunk_objects)
        db.commit()

        logger.info(
            f"Successfully ingested URL '{url}' as source ID {source.id} with {len(chunk_objects)} chunks."
        )

        return IngestResponse(
            message="URL ingested and indexed successfully.",
            source_id=source.id,
            name_or_url=source.name_or_url,
            chunk_count=len(chunk_objects),
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        logger.error(f"Error during URL ingestion: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing the URL: {str(exc)}",
        )


@router.get("/sources", response_model=List[SourceResponse])
def get_sources(db: Session = Depends(get_db)):
    """
    Retrieves all ingested document sources along with their aggregated chunk counts.
    """
    results = (
        db.query(
            DocumentSource.id,
            DocumentSource.source_type,
            DocumentSource.name_or_url,
            DocumentSource.created_at,
            func.count(DocumentChunk.id).label("chunk_count"),
        )
        .outerjoin(DocumentChunk, DocumentSource.id == DocumentChunk.source_id)
        .group_by(
            DocumentSource.id,
            DocumentSource.source_type,
            DocumentSource.name_or_url,
            DocumentSource.created_at,
        )
        .order_by(DocumentSource.created_at.desc())
        .all()
    )

    return [
        SourceResponse(
            id=row.id,
            source_type=row.source_type,
            name_or_url=row.name_or_url,
            created_at=row.created_at,
            chunk_count=row.chunk_count,
        )
        for row in results
    ]


@router.delete("/sources/{source_id}", response_model=MessageResponse)
def delete_source(source_id: int, db: Session = Depends(get_db)):
    """
    Deletes a document source by its ID.
    Cascades deletion to all associated document chunks automatically.
    """
    source = db.query(DocumentSource).filter(DocumentSource.id == source_id).first()
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document source with ID {source_id} not found.",
        )

    db.delete(source)
    db.commit()

    logger.info(f"Deleted source ID {source_id} and its associated chunks.")
    return MessageResponse(
        message=f"Document source {source_id} and its associated chunks were deleted successfully."
    )


# Alias for explicit naming imports
ingestion_router = router

