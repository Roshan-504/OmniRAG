import logging
from typing import List

logger = logging.getLogger(__name__)


def _recursive_split(text: str, separators: List[str], chunk_size: int) -> List[str]:
    """
    Recursively divides text into pieces smaller than or equal to chunk_size
    by evaluating separators in order of precedence (\n\n, \n, space, character).
    """
    text = text.strip()
    if not text:
        return []

    if len(text) <= chunk_size:
        return [text]

    # Find the highest priority separator present in the text
    chosen_sep = None
    sub_separators: List[str] = []

    for idx, sep in enumerate(separators):
        if sep == "":
            chosen_sep = ""
            break
        if sep in text:
            chosen_sep = sep
            sub_separators = separators[idx + 1:]
            break

    # If no delimiter found or empty delimiter reached, slice characters directly
    if chosen_sep is None or chosen_sep == "":
        return [text[i : i + chunk_size].strip() for i in range(0, len(text), chunk_size) if text[i : i + chunk_size].strip()]

    splits = text.split(chosen_sep)
    result_pieces: List[str] = []

    for piece in splits:
        piece = piece.strip()
        if not piece:
            continue
        if len(piece) <= chunk_size:
            result_pieces.append(piece)
        else:
            if sub_separators:
                result_pieces.extend(_recursive_split(piece, sub_separators, chunk_size))
            else:
                result_pieces.extend([
                    piece[i : i + chunk_size].strip()
                    for i in range(0, len(piece), chunk_size)
                    if piece[i : i + chunk_size].strip()
                ])

    return result_pieces


def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 100) -> List[str]:
    """
    Splits text recursively by paragraphs (\\n\\n), lines (\\n), and words (' ').
    Groups pieces into cohesive chunks not exceeding chunk_size, prepending the
    trailing chunk_overlap characters of the prior chunk to preserve semantic context.
    """
    if not text or not text.strip():
        return []

    text = text.strip()
    if len(text) <= chunk_size:
        return [text]

    separators = ["\n\n", "\n", " ", ""]
    atomic_pieces = _recursive_split(text, separators, chunk_size)

    if not atomic_pieces:
        return []

    chunks: List[str] = []
    current_chunk = ""

    for piece in atomic_pieces:
        piece = piece.strip()
        if not piece:
            continue

        if not current_chunk:
            current_chunk = piece
            continue

        # Test if piece fits into current chunk
        candidate = f"{current_chunk}\n\n{piece}"
        if len(candidate) <= chunk_size:
            current_chunk = candidate
        else:
            # Finalize current chunk
            chunks.append(current_chunk)

            # Extract overlap from the end of the finalized chunk
            overlap_prefix = ""
            if chunk_overlap > 0:
                if len(current_chunk) > chunk_overlap:
                    overlap_prefix = current_chunk[-chunk_overlap:].strip()
                else:
                    overlap_prefix = current_chunk.strip()

            # Prepend overlap to the next chunk if within capacity
            if overlap_prefix:
                combined_with_overlap = f"{overlap_prefix}\n\n{piece}"
                if len(combined_with_overlap) <= chunk_size:
                    current_chunk = combined_with_overlap
                else:
                    # If combining overlap with piece exceeds chunk_size, prioritize the piece
                    current_chunk = piece
            else:
                current_chunk = piece

    if current_chunk and (not chunks or current_chunk != chunks[-1]):
        chunks.append(current_chunk)

    return chunks

