"""
Knowledge Base Chunking and Retrieval Service.

Provides:
- Deterministic text chunking with offset tracking.
- Organization-isolated BM25-style relevance scoring (no external dependencies).
- Storage and retrieval for grounding compliance reviews.
"""

import math
import re
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.guideline import KBChunk


def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> List[Dict[str, Any]]:
    """
    Split text into overlapping chunks while tracking starting character offsets.
    """
    if not text or not text.strip():
        return []

    cleaned = text.strip()
    chunks: List[Dict[str, Any]] = []
    start = 0
    total_len = len(cleaned)
    idx = 0

    while start < total_len:
        end = min(start + chunk_size, total_len)
        # Try to find a whitespace boundary near the end if not at the very end
        if end < total_len:
            last_space = cleaned.rfind(" ", start, end)
            if last_space > start + (chunk_size // 2):
                end = last_space

        chunk_str = cleaned[start:end].strip()
        if chunk_str:
            chunks.append({
                "text": chunk_str,
                "offset": start,
                "chunk_index": idx
            })
            idx += 1

        if end >= total_len:
            break
        start = max(start + 1, end - overlap)

    return chunks


def _tokenize(text: str) -> List[str]:
    """Tokenize text into lowercase alphanumeric words."""
    return re.findall(r'\b[a-zA-Z0-9_-]+\b', text.lower())


def bm25_score_chunks(
    query: str,
    chunks: List[KBChunk],
    top_k: int = 5,
    k1: float = 1.5,
    b: float = 0.75
) -> List[Tuple[KBChunk, float]]:
    """
    Compute BM25 relevance scores for a list of KBChunk objects against a query string.
    Returns list of (KBChunk, score) sorted by score descending, containing only score > 0.
    """
    query_tokens = set(_tokenize(query))
    if not query_tokens or not chunks:
        return []

    num_docs = len(chunks)
    doc_tokens_list = [_tokenize(c.text) for c in chunks]
    doc_lens = [len(tokens) for tokens in doc_tokens_list]
    avg_dl = sum(doc_lens) / num_docs if num_docs > 0 else 1.0
    if avg_dl == 0:
        avg_dl = 1.0

    # Calculate document frequency n(t) for each query term
    df: Dict[str, int] = {}
    for t in query_tokens:
        count = sum(1 for tokens in doc_tokens_list if t in tokens)
        if count > 0:
            df[t] = count

    if not df:
        return []

    # Calculate IDF for each term with matches
    idf: Dict[str, float] = {}
    for t, n_t in df.items():
        # Standard BM25 IDF formulation with smoothing
        idf[t] = math.log(1.0 + (num_docs - n_t + 0.5) / (n_t + 0.5))

    scored: List[Tuple[KBChunk, float]] = []
    for chunk, tokens, dl in zip(chunks, doc_tokens_list, doc_lens):
        score = 0.0
        # Term frequencies in this document
        tf_map: Dict[str, int] = {}
        for tok in tokens:
            if tok in df:
                tf_map[tok] = tf_map.get(tok, 0) + 1

        for t, term_idf in idf.items():
            tf = tf_map.get(t, 0)
            if tf > 0:
                numerator = tf * (k1 + 1.0)
                denominator = tf + k1 * (1.0 - b + b * (dl / avg_dl))
                score += term_idf * (numerator / denominator)

        if score > 0.0:
            scored.append((chunk, score))

    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:top_k]


def retrieve_kb_chunks(
    db: Session,
    org: str,
    query_text: str,
    top_k: int = 5
) -> List[KBChunk]:
    """
    Retrieve top relevant KB chunks for the given organization and query text.
    Enforces strict multi-tenant organization boundary.
    """
    if not org or not query_text:
        return []

    # Strict organization filter
    org_chunks = db.query(KBChunk).filter(KBChunk.organization == org).all()
    if not org_chunks:
        return []

    scored = bm25_score_chunks(query_text, org_chunks, top_k=top_k)
    return [chunk for chunk, _score in scored]


def save_document_chunks(
    db: Session,
    filename: str,
    text: str,
    org: str,
    source_doc_id: Optional[int] = None
) -> List[KBChunk]:
    """
    Chunk extracted document text and persist KBChunk records scoped to the caller's organization.
    """
    chunk_data = chunk_text(text)
    created: List[KBChunk] = []

    for item in chunk_data:
        chunk = KBChunk(
            source_doc_name=filename,
            source_doc_id=source_doc_id,
            organization=org,
            text=item["text"],
            chunk_index=item["chunk_index"],
            offset=item["offset"]
        )
        db.add(chunk)
        created.append(chunk)

    if created:
        db.commit()
        for c in created:
            db.refresh(c)

    return created
