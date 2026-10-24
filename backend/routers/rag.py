"""
FastAPI Router for Orbit Real-Time Travel RAG (Retrieval-Augmented Generation).
Provides instant, factually grounded answers backed by 1,160+ SQLite records.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from rag_engine import OrbitRAGIndex, answer_query_with_rag


router = APIRouter(prefix="/api/rag", tags=["Real-Time RAG AI Engine"])


class RAGQueryRequest(BaseModel):
    query: str = Field(..., description="User query in English or Hinglish", example="bhai delhi se bangkok ki cheapest flight konsi hai?")
    top_k: Optional[int] = Field(default=5, ge=1, le=15, description="Number of source documents to retrieve")
    type_filter: Optional[str] = Field(default=None, description="Optional doc_type filter ('flight', 'hotel', 'event', 'visa', 'drop', 'gst', 'booking')")
    city_filter: Optional[str] = Field(default=None, description="Optional city key filter (e.g. 'goa', 'bangkok', 'dubai', 'kashmir')")
    max_price: Optional[int] = Field(default=None, description="Optional maximum price filter")


@router.post("/query")
def query_rag_engine(req: RAGQueryRequest) -> Dict[str, Any]:
    """
    Real-Time Hybrid RAG Query Endpoint.
    1. Scans 1,160+ live inventory items (Flights, Hotels, Events, Visas, Drops, GST).
    2. Uses BM25 + Dense TF-IDF Cosine Vector Retrieval (<10ms).
    3. Synthesizes a factually grounded Hinglish response + Action Card.
    """
    clean_q = req.query.strip()
    if not clean_q:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    indexer = OrbitRAGIndex.get_instance()
    top_docs = indexer.retrieve(
        query=clean_q,
        top_k=req.top_k,
        type_filter=req.type_filter,
        city_filter=req.city_filter,
        max_price=req.max_price,
    )

    from rag_engine import synthesize_rag_response
    import time
    t_start = time.time()
    answer_text, action_card = synthesize_rag_response(clean_q, top_docs)
    total_ms = (time.time() - t_start) * 1000

    sources = [
        {
            "id": doc.id,
            "type": doc.doc_type,
            "title": doc.title,
            "city": doc.city_key,
            "price": doc.price,
            "rating": doc.rating,
            "snippet": doc.summary_text,
            "confidence": score,
            "metadata": doc.metadata,
        }
        for doc, score in top_docs
    ]

    return {
        "query": clean_q,
        "answer": answer_text,
        "sources": sources,
        "action_card": action_card,
        "metrics": {
            "total_ms": round(total_ms, 2),
            "corpus_size": indexer.total_docs,
            "matched_count": len(top_docs),
            "top_confidence": sources[0]["confidence"] if sources else 0.0,
            "engine": "Hybrid BM25 + Dense TF-IDF + Local LLM Fallback",
        }
    }


@router.get("/stats")
def get_rag_stats() -> Dict[str, Any]:
    """Retrieve corpus statistics, indexed categories, and readiness."""
    indexer = OrbitRAGIndex.get_instance()
    type_counts = {}
    for doc in indexer.docs:
        type_counts[doc.doc_type] = type_counts.get(doc.doc_type, 0) + 1

    return {
        "status": "ONLINE",
        "total_documents_indexed": indexer.total_docs,
        "vocabulary_size": len(indexer.vocab),
        "breakdown": type_counts,
        "supported_modalities": [
            "520+ Real-Time Flights (IndiGo, Vistara, Air India, Emirates)",
            "520+ Luxury Stays & Villas (Goa, Jaipur, Kashmir, Dubai, Bangkok)",
            "110+ Live Concerts, Cafes & Evergreen City Life (Coldplay, Diljit, Sunburn)",
            "Flat ₹499 Family Visas (Thailand, Dubai, Vietnam, Indonesia)",
            "60% Off Distressed Airline Seat Drops",
            "myBiz 18% & 5% GST Input Tax Credit Compliance",
            "Real-Time Customer Booking Status & PNR Lookups"
        ],
        "latency_sla": "<10ms retrieval, <50ms end-to-end",
        "last_indexed_epoch": indexer.last_built_at,
    }


@router.post("/refresh")
def refresh_rag_index() -> Dict[str, Any]:
    """Force re-indexing from SQLite database."""
    indexer = OrbitRAGIndex.get_instance()
    indexer.refresh()
    return {
        "status": "SUCCESS",
        "message": f"Successfully re-indexed {indexer.total_docs} items from SQLite database!",
        "last_indexed_epoch": indexer.last_built_at,
    }
