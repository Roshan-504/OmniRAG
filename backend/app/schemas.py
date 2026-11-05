from datetime import datetime
from typing import List
from pydantic import BaseModel, ConfigDict, Field


class HealthResponse(BaseModel):
    """Schema representing the health status response of the backend and database connection."""

    status: str
    database: str

    model_config = ConfigDict(from_attributes=True)


class URLIngestRequest(BaseModel):
    """Payload schema for ingesting text from a web URL."""

    url: str


class SourceResponse(BaseModel):
    """Schema representing an ingested document source with aggregated chunk count."""

    id: int
    source_type: str
    name_or_url: str
    created_at: datetime
    chunk_count: int

    model_config = ConfigDict(from_attributes=True)


class IngestResponse(BaseModel):
    """Response schema returned after successful document ingestion."""

    message: str
    source_id: int
    name_or_url: str
    chunk_count: int


class MessageResponse(BaseModel):
    """Generic message response schema."""

    message: str


# Chat & RAG Schemas


class ChatHistoryItem(BaseModel):
    """Schema representing an individual message in the conversation history."""

    role: str
    content: str


class ChatRequest(BaseModel):
    """Request payload for semantic querying and strict RAG generation."""

    message: str
    top_k: int = 5
    history: List[ChatHistoryItem] = Field(default_factory=list)


class SourceDetail(BaseModel):
    """Metadata representing a referenced document source."""

    name: str
    type: str

    model_config = ConfigDict(from_attributes=True)


class RetrievedChunk(BaseModel):
    """Individual chunk retrieved via vector similarity search."""

    content: str
    source: str
    score: float

    model_config = ConfigDict(from_attributes=True)


class ChatResponse(BaseModel):
    """Response schema containing the synthesized LLM answer and source attribution."""

    answer: str
    sources: List[SourceDetail]
    retrieved_chunks: List[RetrievedChunk]

    model_config = ConfigDict(from_attributes=True)
