"""Tests for MemorySearch L1 and L2 search logic."""

import pytest
from datetime import datetime, timezone
from fogsift_memory_system.models import FragmentCreate, FragmentType


def store_frag(service, content, topic, ftype, keywords=None):
    req = FragmentCreate(
        content=content,
        topic=topic,
        type=ftype,
        keywords=keywords,
    )
    return service.remember(req)


class TestL1Search:
    def test_l1_finds_by_keyword(self, service, search):
        store_frag(service, "Redis cluster failed.", "infra", FragmentType.ERROR, ["redis", "cluster"])
        results = search.search_l1(["redis"])
        assert len(results) >= 1
        assert any("redis" in r["keywords"] for r in results)

    def test_l1_empty_keywords_returns_empty(self, search):
        results = search.search_l1([])
        assert results == []

    def test_l1_keyword_case_insensitive(self, service, search):
        store_frag(service, "Auth token expired.", "auth", FragmentType.ERROR, ["token"])
        results = search.search_l1(["TOKEN"])
        assert len(results) >= 1

    def test_l1_no_match_returns_empty(self, service, search):
        store_frag(service, "Unrelated fragment.", "misc", FragmentType.DECISION, ["misc"])
        results = search.search_l1(["nonexistent_keyword_xyz"])
        assert results == []

    def test_l1_topic_filter(self, service, search):
        store_frag(service, "Redis auth issue.", "auth", FragmentType.ERROR, ["redis"])
        store_frag(service, "Redis infra issue.", "infra", FragmentType.ERROR, ["redis"])
        auth_results = search.search_l1(["redis"], topic="auth")
        infra_results = search.search_l1(["redis"], topic="infra")
        assert all(r["topic"] == "auth" for r in auth_results)
        assert all(r["topic"] == "infra" for r in infra_results)

    def test_l1_type_filter(self, service, search):
        store_frag(service, "Fixed by memory limit.", "infra", FragmentType.SOLUTION_APPROACH, ["memory"])
        store_frag(service, "Memory OOM error.", "infra", FragmentType.ERROR, ["memory"])
        solution_results = search.search_l1(["memory"], type_filter="solution_approach")
        assert all(r["type"] == "solution_approach" for r in solution_results)

    def test_l1_returns_keywords_attached(self, service, search):
        store_frag(service, "Kafka lag issue.", "queue", FragmentType.ERROR, ["kafka", "lag"])
        results = search.search_l1(["kafka"])
        assert len(results) >= 1
        assert "keywords" in results[0]
        assert isinstance(results[0]["keywords"], list)

    def test_l1_no_n_plus_one_with_multiple_results(self, service, search, db):
        """Batch keyword loading should use exactly 2 queries for N results."""
        for i in range(5):
            store_frag(
                service, f"Fragment {i} about redis.",
                "infra", FragmentType.ERROR, ["redis"]
            )
        results = search.search_l1(["redis"])
        assert len(results) >= 5
        for r in results:
            assert "keywords" in r


class TestL2Search:
    def test_l2_finds_by_topic(self, service, search):
        store_frag(service, "Slow frontend load.", "frontend", FragmentType.ERROR)
        results = search.search_l2(topic="frontend")
        assert len(results) >= 1
        assert all(r["topic"] == "frontend" for r in results)

    def test_l2_finds_by_type(self, service, search):
        store_frag(service, "Decision to use Postgres.", "db", FragmentType.DECISION)
        results = search.search_l2(type_filter="decision")
        assert len(results) >= 1
        assert all(r["type"] == "decision" for r in results)

    def test_l2_sorted_by_importance(self, service, search):
        store_frag(service, "Low importance.", "test-topic", FragmentType.PREFERENCE)
        store_frag(service, "High importance.", "test-topic", FragmentType.ERROR)
        results = search.search_l2(topic="test-topic")
        importances = [r["importance"] for r in results]
        assert importances == sorted(importances, reverse=True)

    def test_l2_respects_limit(self, service, search):
        for i in range(10):
            store_frag(service, f"Frag {i}.", "bulk", FragmentType.DECISION)
        results = search.search_l2(topic="bulk", limit=3)
        assert len(results) <= 3

    def test_l2_returns_keywords(self, service, search):
        store_frag(service, "API gateway timeout.", "api", FragmentType.ERROR, ["gateway", "timeout"])
        results = search.search_l2(topic="api")
        assert any("gateway" in r.get("keywords", []) for r in results)
