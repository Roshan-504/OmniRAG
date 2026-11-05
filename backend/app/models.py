from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.database import Base


class DocumentSource(Base):
    """Represents an ingested document source such as a PDF file or a web URL."""

    __tablename__ = "documentsource"

    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(String, nullable=False)
    name_or_url = Column(String, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # One-to-many relationship with cascade delete
    chunks = relationship(
        "DocumentChunk",
        back_populates="source",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class DocumentChunk(Base):
    """Represents an extracted text chunk and its 768-dimensional vector embedding."""

    __tablename__ = "documentchunk"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(
        Integer,
        ForeignKey("documentsource.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=True)
    # Gemini gemini-embedding-001 configured for 768 dimensions
    embedding = Column(Vector(768), nullable=True)

    # Reference back to the parent DocumentSource
    source = relationship("DocumentSource", back_populates="chunks")


class ChatLog(Base):
    """Represents an interaction log of user chat queries and cited source metrics."""

    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String, nullable=False)
    sources_cited = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


