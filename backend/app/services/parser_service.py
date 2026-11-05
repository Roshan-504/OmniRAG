import io
import logging
import re
from bs4 import BeautifulSoup
from fastapi import HTTPException, status
import pypdf
import requests
import trafilatura

logger = logging.getLogger(__name__)


def _clean_whitespace(text: str) -> str:
    """Normalize whitespace and condense redundant blank lines."""
    if not text:
        return ""
    # Normalize carriage returns
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Condense 3+ newlines into 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Strip trailing/leading spaces on lines
    lines = [line.strip() for line in text.split("\n")]
    return "\n".join(lines).strip()


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from all pages of a PDF file using pypdf.
    Returns cleaned plaintext joined with newlines.
    Raises HTTPException(400) if parsing fails or PDF contains no extractable text.
    """
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded PDF file is empty.",
        )

    try:
        pdf_file = io.BytesIO(file_bytes)
        reader = pypdf.PdfReader(pdf_file)

        if len(reader.pages) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The PDF contains no pages.",
            )

        extracted_pages = []
        for index, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                extracted_pages.append(page_text.strip())

        full_text = "\n\n".join(extracted_pages)
        cleaned_text = _clean_whitespace(full_text)

        if not cleaned_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No readable text could be extracted from the PDF (it may contain only scanned images or be encrypted).",
            )

        return cleaned_text

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Failed to extract text from PDF: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error reading or parsing PDF: {str(exc)}",
        )


def extract_text_from_url(url: str) -> str:
    """
    Fetches and extracts clean text from a web URL.
    Attempts extraction first using trafilatura; falls back to Jina Reader API (https://r.jina.ai/{url})
    which renders client-side JavaScript for SPAs.
    Raises HTTPException(400) if both extraction methods fail or return no text.
    """
    if not url or not url.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid URL must be provided.",
        )

    url = url.strip()

    # 1. Primary extraction with trafilatura
    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            extracted = trafilatura.extract(
                downloaded,
                include_comments=False,
                include_tables=True,
                no_fallback=False,
            )
            # If trafilatura extracted meaningful content (at least 100 characters)
            if extracted and len(extracted.strip()) >= 100:
                return _clean_whitespace(extracted)
    except Exception as exc:
        logger.warning(f"Trafilatura extraction failed for {url}: {exc}. Trying Jina Reader fallback...")

    # 2. Fallback to Jina Reader API (handles JavaScript-rendered SPAs)
    try:
        logger.info(f"Invoking Jina Reader API fallback for: {url}")
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) OmniRAG/1.0"
        }
        response = requests.get(f"https://r.jina.ai/{url}", headers=headers, timeout=25)
        if response.status_code == 200 and response.text and response.text.strip():
            return response.text.strip()
    except Exception as exc:
        logger.error(f"Jina Reader fallback failed for {url}: {exc}", exc_info=True)

    # 3. If both methods yielded no content
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Failed to extract readable content from URL '{url}'. The site may be unreachable, blocking automated access, or private.",
    )

