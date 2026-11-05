import os
import re
import json
import math
from pathlib import Path
from typing import List, Dict, Any, Optional
from ..schemas.case import IncidentCategory

class CorpusChunk:
    def __init__(
        self,
        chunk_id: str,
        title: str,
        source_doc: str,
        category: str,
        statutory_basis: str,
        content: str,
        url: str,
        publisher: str
    ):
        self.chunk_id = chunk_id
        self.title = title
        self.source_doc = source_doc
        self.category = category
        self.statutory_basis = statutory_basis
        self.content = content
        self.url = url
        self.publisher = publisher

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "title": self.title,
            "source_doc": self.source_doc,
            "category": self.category,
            "statutory_basis": self.statutory_basis,
            "content": self.content,
            "url": self.url,
            "publisher": self.publisher
        }

class KnowledgeRetriever:
    """
    Semantic & Keyword Hybrid Retrieval Engine for Nigerian Consumer Redress.
    Indexes verified statutory corpus documents (CBN, NCC, FCCPC, NPF-NCCC, Payment Schemes),
    chunks by statutory section, and scores queries against statutory content.
    """
    _chunks: Optional[List[CorpusChunk]] = None
    _legacy_sources: Optional[List[Dict[str, Any]]] = None

    DOCUMENT_METADATA = {
        "cbn_consumer_protection.md": {
            "publisher": "Central Bank of Nigeria (CBN)",
            "category": "FAILED_TRANSFER",
            "statutory_basis": "CBN Consumer Protection Framework & 14-Day Resolution Mandate",
            "url": "https://www.cbn.gov.ng/FinInc/FinLit/LodgeComplaint.html"
        },
        "cbn_electronic_payments.md": {
            "publisher": "Central Bank of Nigeria & NIBSS",
            "category": "FAILED_TRANSFER",
            "statutory_basis": "CBN Guidelines on Electronic Funds Transfer & 30-Digit Session ID Tracing",
            "url": "https://www.cbn.gov.ng/supervision/cpdcomgt.html"
        },
        "ncc_telecom_disputes.md": {
            "publisher": "Nigerian Communications Commission (NCC)",
            "category": "UNDELIVERED_AIRTIME_DATA",
            "statutory_basis": "Nigerian Communications Act 2003 (Article 126 & Toll-Free 622)",
            "url": "https://consumer.ncc.gov.ng/consumer-complaints/procedure-to-file-a-complaint"
        },
        "fccpc_consumer_rights.md": {
            "publisher": "Federal Competition and Consumer Protection Commission (FCCPC)",
            "category": "MERCHANT_NON_DELIVERY",
            "statutory_basis": "Federal Competition and Consumer Protection Act 2018 (Sections 114–130)",
            "url": "https://complaints.fccpc.gov.ng"
        },
        "cybercrime_fraud_protocol.md": {
            "publisher": "NPF National Cybercrime Centre & CBN Fraud Desks",
            "category": "STOLEN_FUNDS_FRAUD",
            "statutory_basis": "Cybercrimes (Prohibition, Prevention) Act 2015 & Emergency PND Liens",
            "url": "https://incb.npf.gov.ng/"
        },
        "payment_gateway_chargebacks.md": {
            "publisher": "Card Schemes & Central Bank of Nigeria",
            "category": "MERCHANT_NON_DELIVERY",
            "statutory_basis": "Mastercard/Visa & Gateway Chargeback Rules for Merchandise Not Received",
            "url": "https://paystack.com/lookup"
        }
    }

    @classmethod
    def load_corpus(cls) -> List[CorpusChunk]:
        if cls._chunks is not None:
            return cls._chunks

        chunks: List[CorpusChunk] = []
        corpus_dir = Path(__file__).parent / "corpus"
        
        if not corpus_dir.exists():
            cls._chunks = []
            return cls._chunks

        for md_file in sorted(corpus_dir.glob("*.md")):
            filename = md_file.name
            meta = cls.DOCUMENT_METADATA.get(filename, {
                "publisher": "Nigerian Regulatory Authority",
                "category": "GENERAL",
                "statutory_basis": "Statutory Regulatory Guidelines",
                "url": "https://www.cbn.gov.ng"
            })

            try:
                text = md_file.read_text(encoding="utf-8")
            except Exception:
                continue

            # Split document into sections by ## or ### headings
            raw_sections = re.split(r'\n(?=##?\s+)', text)
            for idx, sec in enumerate(raw_sections):
                clean_sec = sec.strip()
                if not clean_sec:
                    continue

                # Extract title from first line
                lines = clean_sec.splitlines()
                title_line = lines[0].lstrip("#").strip() if lines else filename
                content_body = "\n".join(lines[1:]).strip() if len(lines) > 1 else clean_sec

                # Category override if section targets specific issue
                sec_cat = meta["category"]
                if "VTU" in title_line or "airtime" in clean_sec.lower():
                    sec_cat = "UNDELIVERED_AIRTIME_DATA"
                elif "chargeback" in title_line.lower():
                    sec_cat = "MERCHANT_NON_DELIVERY"
                elif "ussd" in title_line.lower() or "cybercrime" in clean_sec.lower():
                    sec_cat = "STOLEN_FUNDS_FRAUD"

                chunk = CorpusChunk(
                    chunk_id=f"{md_file.stem}_{idx}",
                    title=title_line,
                    source_doc=filename,
                    category=sec_cat,
                    statutory_basis=meta["statutory_basis"],
                    content=clean_sec,
                    url=meta["url"],
                    publisher=meta["publisher"]
                )
                chunks.append(chunk)

        cls._chunks = chunks
        return cls._chunks

    @classmethod
    def search(cls, query: str, category: Optional[str] = None, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Hybrid retrieval scoring: keyword density + term overlap + category weighting.
        Returns top_k most relevant statutory chunks.
        """
        chunks = cls.load_corpus()
        if not chunks:
            return []

        # Tokenize query
        stop_words = {"the", "and", "or", "to", "in", "a", "of", "is", "for", "on", "my", "i", "was", "with"}
        tokens = [t.lower() for t in re.findall(r'\b\w+\b', query) if t.lower() not in stop_words and len(t) > 2]
        if not tokens:
            tokens = [query.lower()]

        scored: List[tuple] = []
        for ch in chunks:
            text_lower = ch.content.lower() + " " + ch.title.lower()
            score = 0.0

            # Match category bonus
            if category and ch.category == category:
                score += 3.0

            # Exact phrase matches
            if query.lower() in text_lower:
                score += 5.0

            # Keyword matches
            for token in tokens:
                count = text_lower.count(token)
                if count > 0:
                    score += 1.0 + math.log(count)

            if score > 0.5:
                scored.append((score, ch))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = [ch.to_dict() for _, ch in scored[:top_k]]
        return results

    @classmethod
    def load_sources(cls) -> List[Dict[str, Any]]:
        """
        Maintains backwards compatibility with existing API endpoints while enriching with corpus citations.
        """
        if cls._legacy_sources is None:
            sources_path = Path(__file__).parent / "sources.json"
            if sources_path.exists():
                with open(sources_path, "r", encoding="utf-8") as f:
                    cls._legacy_sources = json.load(f)
            else:
                cls._legacy_sources = []
        return cls._legacy_sources

    @classmethod
    def get_sources_for_category(cls, category: Any) -> List[Dict[str, Any]]:
        cat_name = category.value if hasattr(category, "value") else str(category)
        # Search the real corpus first
        corpus_results = cls.search(query=cat_name, category=cat_name, top_k=5)
        if corpus_results:
            return corpus_results
        
        # Fallback to legacy sources
        all_sources = cls.load_sources()
        return [s for s in all_sources if s.get("category") == cat_name]

    @classmethod
    def get_source_by_id(cls, source_id: str) -> Optional[Dict[str, Any]]:
        for ch in cls.load_corpus():
            if ch.chunk_id == source_id:
                return ch.to_dict()
        for s in cls.load_sources():
            if s.get("id") == source_id:
                return s
        return None
