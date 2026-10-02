from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query
from app.services.rag_service import rag_service

router = APIRouter(prefix="/rag", tags=["OneAquaHealth Knowledge Base"])

@router.get("/search")
def search_knowledge(q: str = Query(..., min_length=2, description="Search term or observation description"), top_k: int = 3):
    """Semantic vector search across OneAquaHealth indicators, factsheets, and protocols."""
    return {
        "query": q,
        "results": rag_service.search(q, top_k=top_k)
    }

@router.get("/documents")
def list_documents():
    """Retrieve full catalog of official OneAquaHealth assessment protocols."""
    docs = rag_service.get_all_documents()
    return {
        "count": len(docs),
        "documents": docs
    }
