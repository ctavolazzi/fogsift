"""
Fogsift Memory System - Database Schema
Initializes SQLite database and handles migrations.
"""

import sqlite3
import os

def initialize_database(db_path: str) -> sqlite3.Connection:
    """Creates tables and indexes if they don't exist and returns a connection."""

    # Ensure directory exists if path contains directories
    db_dir = os.path.dirname(db_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row  # Return dict-like rows instead of tuples

    cursor = conn.cursor()

    # 1. Fragments Table (Core Data)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS fragments (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        topic TEXT NOT NULL,
        type TEXT NOT NULL,
        importance REAL DEFAULT 0.5,
        scope TEXT DEFAULT 'permanent',
        ttl_tier TEXT DEFAULT 'hot',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_referenced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reference_count INTEGER DEFAULT 0,
        source JSON
    )
    ''')

    # 2. Keywords Table (L1 Index)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS keywords (
        fragment_id TEXT,
        keyword TEXT NOT NULL,
        FOREIGN KEY(fragment_id) REFERENCES fragments(id) ON DELETE CASCADE
    )
    ''')
    # Critical index for fast L1 lookup (<1ms typical)
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON keywords(keyword)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_keywords_fragment_id ON keywords(fragment_id)')

    # 3. Links Table (Graph Relationships)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS links (
        id TEXT PRIMARY KEY,
        from_id TEXT NOT NULL,
        to_id TEXT NOT NULL,
        relation_type TEXT NOT NULL,
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

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    # Record initialization time if not present
    cursor.execute('''
        INSERT OR IGNORE INTO metadata (key, value)
        VALUES ('db_initialized', CURRENT_TIMESTAMP)
    ''')

    conn.commit()
    return conn
