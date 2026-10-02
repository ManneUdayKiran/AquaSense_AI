import json
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.core.config import settings

logger = logging.getLogger(__name__)

class OneAquaHealthRAGService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(OneAquaHealthRAGService, cls).__new__(cls)
            cls._instance.initialized = False
        return cls._instance

    def __init__(self):
        if getattr(self, "initialized", False):
            return
        self.documents: List[Dict[str, Any]] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.doc_vectors = None
        self._load_and_index()
        self.initialized = True

    def _load_and_index(self):
        kb_path = settings.DATA_DIR / "oneaquahealth_knowledge.json"
        if not kb_path.exists():
            logger.warning(f"Knowledge base not found at {kb_path}")
            return

        try:
            with open(kb_path, "r", encoding="utf-8") as f:
                self.documents = json.load(f)

            corpus = []
            for doc in self.documents:
                indicators = " ".join(doc.get("key_indicators", []))
                thresholds = " ".join(f"{k} {v}" for k, v in doc.get("thresholds", {}).items())
                actions = " ".join(doc.get("recommended_actions", []))
                text = f"{doc.get('title', '')} {doc.get('category', '')} {doc.get('content', '')} {indicators} {thresholds} {actions}"
                corpus.append(text)

            self.vectorizer = TfidfVectorizer(
                stop_words="english",
                ngram_range=(1, 2),
                max_features=2500
            )
            self.doc_vectors = self.vectorizer.fit_transform(corpus)
            logger.info(f"Loaded and indexed {len(self.documents)} OneAquaHealth documents into RAG vector space.")
        except Exception as e:
            logger.error(f"Failed to index knowledge base: {e}")

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Retrieve most relevant OneAquaHealth documents with similarity scores."""
        if not self.documents or self.vectorizer is None or self.doc_vectors is None:
            return []

        query_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vec, self.doc_vectors)[0]

        top_indices = np.argsort(scores)[::-1][:top_k]
        results = []
        for idx in top_indices:
            score = float(scores[idx])
            doc = self.documents[idx].copy()
            doc["relevance_score"] = round(score, 4)
            results.append(doc)

        return results

    def get_citations(self, query: str, top_k: int = 2) -> List[str]:
        """Extract authoritative document citations for prompt grounding."""
        matches = self.search(query, top_k=top_k)
        citations = []
        for doc in matches:
            citation = f"{doc.get('title')} ({doc.get('source_document')})"
            if citation not in citations:
                citations.append(citation)
        return citations

    def get_all_documents(self) -> List[Dict[str, Any]]:
        return self.documents

rag_service = OneAquaHealthRAGService()
