"""
Fogsift Memory System - Database Schema
Initializes SQLite database and handles migrations.
"""

import sqlite3
import os


def initialize_database(db_path: str) -> sqlite3.Connection:
    """Creates tables and indexes if they don't exist and returns a connection."""

    db_dir = os.path.dirname(db_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    # Enable foreign keys, WAL mode, and busy timeout
    cursor.execute("PRAGMA foreign_keys = ON;")
    cursor.execute("PRAGMA journal_mode = WAL;")
    cursor.execute("PRAGMA busy_timeout = 5000;")

    # 1. Fragments Table (Core Data)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS fragments (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL CHECK(length(content) > 0),
        topic TEXT NOT NULL CHECK(length(topic) > 0),
        type TEXT NOT NULL CHECK(type IN (
            'client_pattern', 'solution_approach', 'decision',
            'error', 'preference', 'procedure'
        )),
        importance REAL DEFAULT 0.5 CHECK(importance >= 0.0 AND importance <= 1.0),
        scope TEXT DEFAULT 'permanent' CHECK(scope IN ('permanent', 'session')),
        ttl_tier TEXT DEFAULT 'hot' CHECK(ttl_tier IN ('hot', 'warm', 'cold')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_referenced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reference_count INTEGER DEFAULT 0 CHECK(reference_count >= 0),
        source JSON
    )
    ''')

    # 2. Keywords Table (L1 Index) — UNIQUE prevents duplicate keywords per fragment
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS keywords (
        fragment_id TEXT NOT NULL,
        keyword TEXT NOT NULL,
        UNIQUE(fragment_id, keyword),
        FOREIGN KEY(fragment_id) REFERENCES fragments(id) ON DELETE CASCADE
    )
    ''')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON keywords(keyword)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_keywords_fragment_id ON keywords(fragment_id)')

    # 3. Links Table (Graph Relationships)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS links (
        id TEXT PRIMARY KEY,
        from_id TEXT NOT NULL,
        to_id TEXT NOT NULL,
        relation_type TEXT NOT NULL CHECK(relation_type IN (
            'related', 'caused_by', 'resolved_by', 'part_of', 'contradicts', 'informs'
        )),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(from_id) REFERENCES fragments(id) ON DELETE CASCADE,
        FOREIGN KEY(to_id) REFERENCES fragments(id) ON DELETE CASCADE
    )
    ''')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_links_from ON links(from_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_links_to ON links(to_id)')

    # 4. Metadata Table (System State)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # L2 search support indexes
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_fragments_topic ON fragments(topic)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_fragments_type ON fragments(type)')
    cursor.execute(
        'CREATE INDEX IF NOT EXISTS idx_fragments_importance_recency '
        'ON fragments(importance DESC, last_referenced DESC)'
    )

    cursor.execute('''
        INSERT OR IGNORE INTO metadata (key, value)
        VALUES ('db_initialized', CURRENT_TIMESTAMP)
    ''')

    conn.commit()
    return conn
