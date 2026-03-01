"""
Fogsift Memory System - Data Access Layer
Handles direct SQLite CRUD operations.
"""

import sqlite3
import json
from typing import List, Dict, Any, Optional


class MemoryStore:
    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn

    def create_fragment(self, frag_data: Dict[str, Any], keywords: List[str]) -> str:
        source_json = json.dumps(frag_data.get("source")) if frag_data.get("source") else None

        with self.conn:  # Automatic rollback on any exception
            self.conn.execute('''
                INSERT INTO fragments
                (id, content, topic, type, importance, scope, ttl_tier,
                 created_at, last_referenced, reference_count, source)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                frag_data["id"], frag_data["content"], frag_data["topic"],
                frag_data["type"], frag_data["importance"], frag_data["scope"],
                frag_data["ttl_tier"], frag_data["created_at"],
                frag_data["last_referenced"], frag_data["reference_count"],
                source_json,
            ))

            # INSERT OR IGNORE because schema now has UNIQUE(fragment_id, keyword)
            for kw in keywords:
                self.conn.execute(
                    'INSERT OR IGNORE INTO keywords (fragment_id, keyword) VALUES (?, ?)',
                    (frag_data["id"], kw.lower()[:100]),  # enforce keyword length
                )

        return frag_data["id"]

    def get_fragment(self, fragment_id: str) -> Optional[Dict[str, Any]]:
        cursor = self.conn.cursor()
        cursor.execute('SELECT * FROM fragments WHERE id = ?', (fragment_id,))
        row = cursor.fetchone()
        if not row:
            return None

        frag_dict = dict(row)
        if frag_dict.get("source"):
            try:
                frag_dict["source"] = json.loads(frag_dict["source"])
            except (json.JSONDecodeError, TypeError):
                frag_dict["source"] = None

        cursor.execute(
            'SELECT keyword FROM keywords WHERE fragment_id = ?', (fragment_id,)
        )
        frag_dict["keywords"] = [k["keyword"] for k in cursor.fetchall()]
        return frag_dict

    def delete_fragment(self, fragment_id: str) -> bool:
        with self.conn:
            cursor = self.conn.execute(
                'DELETE FROM fragments WHERE id = ?', (fragment_id,)
            )
        return cursor.rowcount > 0

    def increment_reference(self, fragment_ids: List[str]) -> None:
        if not fragment_ids:
            return
        placeholders = ','.join(['?'] * len(fragment_ids))
        with self.conn:
            self.conn.execute(f'''
                UPDATE fragments
                SET reference_count = reference_count + 1,
                    last_referenced = CURRENT_TIMESTAMP
                WHERE id IN ({placeholders})
            ''', fragment_ids)

    def create_link(self, link_id: str, from_id: str, to_id: str, relation_type: str) -> str:
        with self.conn:
            self.conn.execute('''
                INSERT INTO links (id, from_id, to_id, relation_type)
                VALUES (?, ?, ?, ?)
            ''', (link_id, from_id, to_id, relation_type))
        return link_id

    def fragment_exists(self, fragment_id: str) -> bool:
        row = self.conn.execute(
            'SELECT 1 FROM fragments WHERE id = ? LIMIT 1', (fragment_id,)
        ).fetchone()
        return row is not None

    def get_stats(self) -> Dict[str, Any]:
        cursor = self.conn.cursor()
        return {
            "total_fragments": cursor.execute(
                'SELECT COUNT(*) FROM fragments'
            ).fetchone()[0],
            "by_type": dict(cursor.execute(
                'SELECT type, COUNT(*) FROM fragments GROUP BY type'
            ).fetchall()),
            "by_tier": dict(cursor.execute(
                'SELECT ttl_tier, COUNT(*) FROM fragments GROUP BY ttl_tier'
            ).fetchall()),
            "by_topic": dict(cursor.execute(
                'SELECT topic, COUNT(*) FROM fragments GROUP BY topic'
            ).fetchall()),
            "oldest_fragment": cursor.execute(
                'SELECT MIN(created_at) FROM fragments'
            ).fetchone()[0],
            "newest_fragment": cursor.execute(
                'SELECT MAX(created_at) FROM fragments'
            ).fetchone()[0],
        }
