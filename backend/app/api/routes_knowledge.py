from fastapi import APIRouter
from ..knowledge.retriever import KnowledgeRetriever
from ..security.emergency_directory import NIGERIAN_BANKS_EMERGENCY_DATA

router = APIRouter(prefix="/knowledge", tags=["Knowledge"])

@router.get("/sources")
def get_sources():
    return KnowledgeRetriever.load_sources()

@router.get("/emergency-codes")
def get_emergency_codes():
    return NIGERIAN_BANKS_EMERGENCY_DATA
