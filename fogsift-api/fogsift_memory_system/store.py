import sqlite3
import json
from datetime import datetime
from typing import Optional

from .models import MemoryFragment


def initialize_database(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS memories (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            topic TEXT NOT NULL DEFAULT 'general',
            type TEXT NOT NULL DEFAULT 'fact',
            importance REAL NOT NULL DEFAULT 0.5,
            tags TEXT NOT NULL DEFAULT '[]',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_memories_topic ON memories(topic)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_memories_importance ON memories(importance)
    """)

    # FTS5 virtual table for full-text search
    cursor.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
            id UNINDEXED,
            content,
            topic,
            content='memories',
            content_rowid='rowid'
        )
    """)

    # Triggers to keep FTS index in sync
    cursor.execute("""
        CREATE TRIGGER IF NOT EXISTS memories_ai AFTER INSERT ON memories BEGIN
            INSERT INTO memories_fts(rowid, id, content, topic)
            VALUES (new.rowid, new.id, new.content, new.topic);
        END
    """)
    cursor.execute("""
        CREATE TRIGGER IF NOT EXISTS memories_ad AFTER DELETE ON memories BEGIN
            INSERT INTO memories_fts(memories_fts, rowid, id, content, topic)
            VALUES('delete', old.rowid, old.id, old.content, old.topic);
        END
    """)
    cursor.execute("""
        CREATE TRIGGER IF NOT EXISTS memories_au AFTER UPDATE ON memories BEGIN
            INSERT INTO memories_fts(memories_fts, rowid, id, content, topic)
            VALUES('delete', old.rowid, old.id, old.content, old.topic);
            INSERT INTO memories_fts(rowid, id, content, topic)
            VALUES (new.rowid, new.id, new.content, new.topic);
        END
    """)

    conn.commit()
    return conn


class MemoryStore:
    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn

    def create(self, fragment: MemoryFragment) -> MemoryFragment:
        self.conn.execute(
            """
            INSERT INTO memories (id, content, topic, type, importance, tags, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                fragment.id,
                fragment.content,
                fragment.topic,
                fragment.type,
                fragment.importance,
                json.dumps(fragment.tags),
                fragment.created_at.isoformat(),
                fragment.updated_at.isoformat(),
            ),
        )
        self.conn.commit()
        return fragment

    def get(self, fragment_id: str) -> Optional[MemoryFragment]:
        row = self.conn.execute(
            "SELECT * FROM memories WHERE id = ?", (fragment_id,)
        ).fetchone()
        return self._row_to_fragment(row) if row else None

    def list(
        self,
        topic: Optional[str] = None,
        type_: Optional[str] = None,
        min_importance: float = 0.0,
        limit: int = 100,
        offset: int = 0,
    ) -> list[MemoryFragment]:
        query = "SELECT * FROM memories WHERE importance >= ?"
        params: list = [min_importance]
        if topic:
            query += " AND topic = ?"
            params.append(topic)
        if type_:
            query += " AND type = ?"
            params.append(type_)
        query += " ORDER BY importance DESC, created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        rows = self.conn.execute(query, params).fetchall()
        return [self._row_to_fragment(r) for r in rows]

    def delete(self, fragment_id: str) -> bool:
        cursor = self.conn.execute(
            "DELETE FROM memories WHERE id = ?", (fragment_id,)
        )
        self.conn.commit()
        return cursor.rowcount > 0

    def stats(self) -> dict:
        total = self.conn.execute("SELECT COUNT(*) FROM memories").fetchone()[0]
        topics = dict(
            self.conn.execute(
                "SELECT topic, COUNT(*) FROM memories GROUP BY topic"
            ).fetchall()
        )
        types = dict(
            self.conn.execute(
                "SELECT type, COUNT(*) FROM memories GROUP BY type"
            ).fetchall()
        )
        avg_importance = (
            self.conn.execute("SELECT AVG(importance) FROM memories").fetchone()[0] or 0.0
        )
        return {
            "total_memories": total,
            "topics": topics,
            "types": types,
            "avg_importance": avg_importance,
        }

    def _row_to_fragment(self, row) -> MemoryFragment:
        return MemoryFragment(
            id=row["id"],
            content=row["content"],
            topic=row["topic"],
            type=row["type"],
            importance=row["importance"],
            tags=json.loads(row["tags"]),
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"]),
        )
