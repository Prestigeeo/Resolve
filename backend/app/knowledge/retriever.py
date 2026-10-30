import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from ..schemas.case import IncidentCategory

class KnowledgeRetriever:
    """
    Retrieves verified official regulatory guidance records based on case category and metadata.
    """
    _sources: Optional[List[Dict[str, Any]]] = None

    @classmethod
    def load_sources(cls) -> List[Dict[str, Any]]:
        if cls._sources is None:
            sources_path = Path(__file__).parent / "sources.json"
            if sources_path.exists():
                with open(sources_path, "r", encoding="utf-8") as f:
                    cls._sources = json.load(f)
            else:
                cls._sources = []
        return cls._sources

    @classmethod
    def get_sources_for_category(cls, category: IncidentCategory) -> List[Dict[str, Any]]:
        all_sources = cls.load_sources()
        cat_name = category.value if hasattr(category, "value") else str(category)
        return [s for s in all_sources if s.get("category") == cat_name]

    @classmethod
    def get_source_by_id(cls, source_id: str) -> Optional[Dict[str, Any]]:
        all_sources = cls.load_sources()
        for s in all_sources:
            if s.get("id") == source_id:
                return s
        return None
