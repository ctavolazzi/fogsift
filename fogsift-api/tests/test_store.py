"""Tests for MemoryStore CRUD operations."""

import pytest
from datetime import datetime, timezone


def _frag_data(fragment_id="frag_test001"):
    now = datetime.now(timezone.utc).isoformat()
    return {
        "id": fragment_id,
        "content": "Test content for store tests.",
        "topic": "test",
        "type": "error",
        "importance": 0.8,
        "scope": "permanent",
        "ttl_tier": "hot",
        "created_at": now,
        "last_referenced": now,
        "reference_count": 0,
        "source": None,
    }


class TestCreateFragment:
    def test_create_and_retrieve(self, store):
        data = _frag_data()
        store.create_fragment(data, ["redis", "test"])
        result = store.get_fragment(data["id"])
        assert result is not None
        assert result["content"] == data["content"]
        assert "redis" in result["keywords"]
        assert "test" in result["keywords"]

    def test_keywords_stored_lowercase(self, store):
        data = _frag_data()
        store.create_fragment(data, ["Redis", "CLUSTER"])
        result = store.get_fragment(data["id"])
        assert "redis" in result["keywords"]
        assert "cluster" in result["keywords"]

    def test_duplicate_keywords_deduplicated(self, store):
        data = _frag_data()
        store.create_fragment(data, ["redis", "redis", "cluster"])
        result = store.get_fragment(data["id"])
        keywords = result["keywords"]
        assert keywords.count("redis") == 1

    def test_source_json_roundtrip(self, store):
        data = _frag_data()
        data["source"] = {"client_id": "acme", "session": "2026-01"}
        store.create_fragment(data, [])
        result = store.get_fragment(data["id"])
        assert result["source"]["client_id"] == "acme"

    def test_no_keywords_stored(self, store):
        data = _frag_data()
        store.create_fragment(data, [])
        result = store.get_fragment(data["id"])
        assert result["keywords"] == []


class TestGetFragment:
    def test_missing_returns_none(self, store):
        assert store.get_fragment("nonexistent") is None

    def test_existing_returns_dict(self, store):
        data = _frag_data()
        store.create_fragment(data, [])
        result = store.get_fragment(data["id"])
        assert isinstance(result, dict)


class TestDeleteFragment:
    def test_delete_existing(self, store):
        data = _frag_data()
        store.create_fragment(data, ["kw"])
        assert store.delete_fragment(data["id"]) is True
        assert store.get_fragment(data["id"]) is None

    def test_delete_nonexistent_returns_false(self, store):
        assert store.delete_fragment("nope") is False

    def test_keywords_cascade_deleted(self, store, db):
        data = _frag_data()
        store.create_fragment(data, ["redis"])
        store.delete_fragment(data["id"])
        kw_count = db.execute(
            "SELECT COUNT(*) FROM keywords WHERE fragment_id = ?", (data["id"],)
        ).fetchone()[0]
        assert kw_count == 0


class TestIncrementReference:
    def test_increments_count(self, store):
        data = _frag_data()
        store.create_fragment(data, [])
        store.increment_reference([data["id"]])
        result = store.get_fragment(data["id"])
        assert result["reference_count"] == 1

    def test_empty_list_is_noop(self, store):
        store.increment_reference([])  # Must not raise

    def test_multiple_increments(self, store):
        data = _frag_data()
        store.create_fragment(data, [])
        store.increment_reference([data["id"]])
        store.increment_reference([data["id"]])
        result = store.get_fragment(data["id"])
        assert result["reference_count"] == 2


class TestCreateLink:
    def test_create_link(self, store):
        d1 = _frag_data("frag_001")
        d2 = _frag_data("frag_002")
        store.create_fragment(d1, [])
        store.create_fragment(d2, [])
        link_id = store.create_link("link_abc", "frag_001", "frag_002", "resolved_by")
        assert link_id == "link_abc"

    def test_link_cascade_on_delete(self, store, db):
        d1 = _frag_data("frag_a")
        d2 = _frag_data("frag_b")
        store.create_fragment(d1, [])
        store.create_fragment(d2, [])
        store.create_link("link_x", "frag_a", "frag_b", "related")
        store.delete_fragment("frag_a")
        count = db.execute("SELECT COUNT(*) FROM links WHERE id = 'link_x'").fetchone()[0]
        assert count == 0


class TestGetStats:
    def test_empty_db_stats(self, store):
        stats = store.get_stats()
        assert stats["total_fragments"] == 0
        assert stats["oldest_fragment"] is None
        assert stats["newest_fragment"] is None
        assert stats["by_type"] == {}

    def test_stats_with_fragments(self, store):
        d1 = _frag_data("frag_s1")
        d1["type"] = "error"
        d2 = _frag_data("frag_s2")
        d2["type"] = "decision"
        store.create_fragment(d1, [])
        store.create_fragment(d2, [])
        stats = store.get_stats()
        assert stats["total_fragments"] == 2
        assert stats["by_type"]["error"] == 1
        assert stats["by_type"]["decision"] == 1
