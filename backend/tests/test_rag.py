from app.services.rag_service import rag_service

def test_rag_knowledge_indexing():
    """Verify that OneAquaHealth knowledge base is loaded and indexed."""
    docs = rag_service.get_all_documents()
    assert len(docs) >= 5
    first = docs[0]
    assert "protocol_code" in first
    assert "title" in first
    assert "thresholds" in first

def test_rag_search_relevance():
    """Verify semantic retrieval returns relevant documents for foam/surfactant queries."""
    results = rag_service.search("billowing detergent foam floating on river", top_k=2)
    assert len(results) > 0
    top_doc = results[0]
    assert "foam" in top_doc["title"].lower() or "surfactant" in top_doc["title"].lower()
    assert top_doc["relevance_score"] > 0.1

def test_rag_citations_generation():
    """Verify citation generator extracts properly formatted source citations."""
    citations = rag_service.get_citations("cyanobacteria algal bloom green scum", top_k=1)
    assert len(citations) == 1
    assert "OneAquaHealth" in citations[0]
