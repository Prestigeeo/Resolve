from typing import Optional
from fastapi import APIRouter, Query
from ..knowledge.retriever import KnowledgeRetriever
from ..security.emergency_directory import NIGERIAN_BANKS_EMERGENCY_DATA

router = APIRouter(prefix="/knowledge", tags=["Knowledge"])

@router.get("/sources")
def get_sources():
    return KnowledgeRetriever.load_sources()

@router.get("/search")
def search_corpus(
    q: str = Query(..., min_length=2, description="Natural language dispute query or legal concept"),
    category: Optional[str] = Query(None, description="Optional incident category filter"),
    limit: int = Query(4, ge=1, le=10)
):
    """
    Semantic & keyword search across official Nigerian consumer regulations (CBN, NCC, FCCPC, NPF-NCCC, Payment Schemes).
    """
    return KnowledgeRetriever.search(query=q, category=category, top_k=limit)

@router.get("/corpus/chunks")
def get_all_chunks():
    """
    Retrieves all indexed regulatory knowledge chunks.
    """
    return [ch.to_dict() for ch in KnowledgeRetriever.load_corpus()]

@router.get("/emergency-codes")
def get_emergency_codes():
    return NIGERIAN_BANKS_EMERGENCY_DATA
