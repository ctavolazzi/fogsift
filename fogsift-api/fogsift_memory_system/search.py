"""
Fogsift Memory System - Search Engine
Handles L1 (Keyword) and L2 (Metadata) search logic.
"""

from typing import List, Dict, Any, Optional
from .store import MemoryStore


class MemorySearch:
    def __init__(self, store: MemoryStore):
        self.store = store

    def search_l1(self, keywords: List[str], topic: Optional[str] = None, type_filter: Optional[str] = None) -> List[Dict]:
        """L1 Search: Exact keyword matching. Fastest retrieval."""
        if not keywords:
            return []

        cursor = self.store.conn.cursor()

        # Build query safely
        query = '''
            SELECT DISTINCT f.* FROM fragments f
            JOIN keywords k ON f.id = k.fragment_id
            WHERE k.keyword IN ({})
        '''.format(','.join(['?'] * len(keywords)))

        params = [k.lower() for k in keywords]

        if topic:
            query += " AND f.topic = ?"
            params.append(topic)

        if type_filter:
            query += " AND f.type = ?"
            params.append(type_filter)

        cursor.execute(query, params)
        rows = cursor.fetchall()
        return self._format_results(rows)

    def search_l2(self, topic: Optional[str] = None, type_filter: Optional[str] = None, limit: int = 50) -> List[Dict]:
        """L2 Search: Metadata filtering. Used when L1 is insufficient or empty."""
        cursor = self.store.conn.cursor()

        query = "SELECT * FROM fragments WHERE 1=1"
        params = []

        if topic:
            query += " AND topic = ?"
            params.append(topic)

        if type_filter:
            query += " AND type = ?"
            params.append(type_filter)

        query += " ORDER BY importance DESC, last_referenced DESC LIMIT ?"
        params.append(limit)

        cursor.execute(query, params)
        rows = cursor.fetchall()
        return self._format_results(rows)

    def _format_results(self, rows) -> List[Dict]:
        """Helper to attach keywords to search results"""
        results = []
        cursor = self.store.conn.cursor()
        for row in rows:
            frag_dict = dict(row)
            cursor.execute('SELECT keyword FROM keywords WHERE fragment_id = ?', (frag_dict["id"],))
            frag_dict["keywords"] = [k["keyword"] for k in cursor.fetchall()]
            results.append(frag_dict)
        return results
