"""
Fogsift Memory System - Business Logic Service
Orchestrates storage, search, ranking, and handles Pydantic models.
"""

import uuid
import time
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from .models import (
    FragmentCreate, FragmentResponse, LinkCreate, LinkResponse,
    RecallRequest, RecallResponse, FragmentStats, TTLTier, FragmentType
)
from .store import MemoryStore
from .search import MemorySearch


class MemoryService:
    def __init__(self, store: MemoryStore, search: MemorySearch):
        self.store = store
        self.search = search

    def _get_default_importance(self, type_val: FragmentType) -> float:
        """Applies importance rules from the Architecture Doc"""
        mapping = {
            FragmentType.PROCEDURE: 0.65,
            FragmentType.DECISION: 0.7,
            FragmentType.SOLUTION_APPROACH: 0.85,
            FragmentType.ERROR: 0.9,
            FragmentType.PREFERENCE: 0.95,
            FragmentType.CLIENT_PATTERN: 0.6
        }
        return mapping.get(type_val, 0.5)

    def _extract_keywords(self, content: str) -> List[str]:
        """Basic keyword extraction (simulated for standalone use)"""
        words = content.lower().replace('.', '').replace(',', '').split()
        return list(set(w for w in words if len(w) > 3))[:5]

    def remember(self, request: FragmentCreate) -> FragmentResponse:
        frag_id = f"frag_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()

        keywords = request.keywords or self._extract_keywords(request.content)
        importance = request.importance or self._get_default_importance(request.type)

        frag_data = {
            "id": frag_id,
            "content": request.content,
            "topic": request.topic,
            "type": request.type,
            "importance": importance,
            "scope": request.scope,
            "ttl_tier": TTLTier.HOT,
            "created_at": now,
            "last_referenced": now,
            "reference_count": 0,
            "source": request.source
        }

        self.store.create_fragment(frag_data, keywords)

        stored_data = self.store.get_fragment(frag_id)
        return FragmentResponse(**stored_data)

    def recall(self, request: RecallRequest) -> RecallResponse:
        start_time = time.time()
        search_path = []
        found_fragments = []

        # L1 Search (Keyword exact match)
        if request.keywords:
            l1_results = self.search.search_l1(request.keywords, request.topic, request.type)
            if l1_results:
                search_path.append(f"L1:{len(l1_results)}")
                found_fragments.extend(l1_results)

        # L2 Search (Fallback/Expansion metadata search)
        if not found_fragments and (request.topic or request.type):
            l2_results = self.search.search_l2(request.topic, request.type)
            if l2_results:
                search_path.append(f"L2:{len(l2_results)}")
                found_fragments.extend(l2_results)

        # Deduplicate and sort by importance
        unique_frags = {f["id"]: f for f in found_fragments}.values()
        sorted_frags = sorted(unique_frags, key=lambda x: x["importance"], reverse=True)

        # Enforce naive token budget (approx 1 token = 4 chars)
        final_results = []
        current_tokens = 0
        for frag in sorted_frags:
            est_tokens = len(frag["content"]) // 4
            if current_tokens + est_tokens <= request.token_budget:
                final_results.append(frag)
                current_tokens += est_tokens
            else:
                break

        # Update references
        if final_results:
            self.store.increment_reference([f["id"] for f in final_results])

        end_time = time.time()

        return RecallResponse(
            success=True,
            fragments=[FragmentResponse(**f) for f in final_results],
            total_tokens=current_tokens,
            search_path=search_path,
            query_time_ms=round((end_time - start_time) * 1000, 2)
        )

    def forget(self, fragment_id: str) -> bool:
        return self.store.delete_fragment(fragment_id)

    def link(self, request: LinkCreate) -> LinkResponse:
        link_id = f"link_{uuid.uuid4().hex[:8]}"
        self.store.create_link(link_id, request.from_id, request.to_id, request.relation_type)
        return LinkResponse(
            id=link_id,
            from_id=request.from_id,
            to_id=request.to_id,
            relation_type=request.relation_type,
            created_at=datetime.now(timezone.utc)
        )

    def get_stats(self) -> FragmentStats:
        return FragmentStats(**self.store.get_stats())
