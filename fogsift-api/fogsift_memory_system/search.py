from typing import Optional

from .models import MemoryFragment
from .store import MemoryStore


class MemorySearch:
    def __init__(self, store: MemoryStore):
        self.store = store

    def search(
        self,
        query: str,
        topic: Optional[str] = None,
        type_: Optional[str] = None,
        limit: int = 10,
        min_importance: float = 0.0,
    ) -> list[MemoryFragment]:
        conn = self.store.conn

        # Try FTS5 full-text search first
        fts_sql = """
            SELECT m.* FROM memories m
            INNER JOIN memories_fts fts ON m.id = fts.id
            WHERE memories_fts MATCH ?
            AND m.importance >= ?
        """
        params: list = [query, min_importance]

        if topic:
            fts_sql += " AND m.topic = ?"
            params.append(topic)
        if type_:
            fts_sql += " AND m.type = ?"
            params.append(type_)

        fts_sql += " ORDER BY rank, m.importance DESC LIMIT ?"
        params.append(limit)

        try:
            rows = conn.execute(fts_sql, params).fetchall()
            return [self.store._row_to_fragment(r) for r in rows]
        except Exception:
            # Fall back to LIKE search if FTS query is malformed
            like_sql = """
                SELECT * FROM memories
                WHERE content LIKE ?
                AND importance >= ?
            """
            like_params: list = [f"%{query}%", min_importance]
            if topic:
                like_sql += " AND topic = ?"
                like_params.append(topic)
            if type_:
                like_sql += " AND type = ?"
                like_params.append(type_)
            like_sql += " ORDER BY importance DESC LIMIT ?"
            like_params.append(limit)
            rows = conn.execute(like_sql, like_params).fetchall()
            return [self.store._row_to_fragment(r) for r in rows]
