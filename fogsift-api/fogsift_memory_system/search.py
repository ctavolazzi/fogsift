"""
Fogsift Memory System - Search Engine
Handles L1 (Keyword) and L2 (Metadata) search logic.
"""

from typing import List, Dict, Any, Optional
from .store import MemoryStore


class MemorySearch:
    def __init__(self, store: MemoryStore):
        self.store = store

    def search_l1(
        self,
        keywords: List[str],
        topic: Optional[str] = None,
        type_filter: Optional[str] = None,
    ) -> List[Dict]:
        """L1 Search: Exact keyword matching. Fastest retrieval."""
        if not keywords:
            return []

        cursor = self.store.conn.cursor()
        placeholders = ','.join(['?'] * len(keywords))
        query = f'''
            SELECT DISTINCT f.* FROM fragments f
            JOIN keywords k ON f.id = k.fragment_id
            WHERE k.keyword IN ({placeholders})
        '''
        params: List[Any] = [k.lower() for k in keywords]

        if topic:
            query += " AND f.topic = ?"
            params.append(topic)
        if type_filter:
            query += " AND f.type = ?"
            params.append(type_filter)

        cursor.execute(query, params)
        return self._format_results(cursor.fetchall())

    def search_l2(
        self,
        topic: Optional[str] = None,
        type_filter: Optional[str] = None,
        limit: int = 50,
    ) -> List[Dict]:
        """L2 Search: Metadata filtering. Used when L1 is insufficient or empty."""
        cursor = self.store.conn.cursor()
        query = "SELECT * FROM fragments WHERE 1=1"
        params: List[Any] = []

        if topic:
            query += " AND topic = ?"
            params.append(topic)
        if type_filter:
            query += " AND type = ?"
            params.append(type_filter)

        query += " ORDER BY importance DESC, last_referenced DESC LIMIT ?"
        params.append(limit)

        cursor.execute(query, params)
        return self._format_results(cursor.fetchall())

    def _format_results(self, rows) -> List[Dict]:
        """Batch-load keywords to avoid N+1 queries."""
        if not rows:
            return []

        results = [dict(row) for row in rows]
        fragment_ids = [r["id"] for r in results]
        placeholders = ','.join(['?'] * len(fragment_ids))

        cursor = self.store.conn.cursor()
        kw_rows = cursor.execute(
            f'SELECT fragment_id, keyword FROM keywords WHERE fragment_id IN ({placeholders})',
            fragment_ids,
        ).fetchall()

        kw_map: Dict[str, List[str]] = {}
        for kw_row in kw_rows:
            kw_map.setdefault(kw_row["fragment_id"], []).append(kw_row["keyword"])

        for r in results:
            r["keywords"] = kw_map.get(r["id"], [])

        return results
