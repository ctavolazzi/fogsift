"""Tests for MemoryService business logic."""

import pytest
from fogsift_memory_system.models import (
    FragmentCreate, FragmentType, FragmentResponse,
    RecallRequest, RecallResponse, LinkCreate, LinkRelationType,
)


class TestRemember:
    def test_remember_returns_fragment_response(self, service):
        req = FragmentCreate(
            content="Redis cluster failed.", topic="infra", type=FragmentType.ERROR
        )
        result = service.remember(req)
        assert isinstance(result, FragmentResponse)
        assert result.id.startswith("frag_")
        assert result.ttl_tier.value == "hot"

    def test_remember_applies_default_importance(self, service):
        req = FragmentCreate(
            content="Critical preference.", topic="process", type=FragmentType.PREFERENCE
        )
        result = service.remember(req)
        assert result.importance == 0.95  # PREFERENCE default

    def test_remember_respects_explicit_importance(self, service):
        req = FragmentCreate(
            content="Custom importance.", topic="test", type=FragmentType.ERROR,
            importance=0.3,
        )
        result = service.remember(req)
        assert result.importance == 0.3

    def test_remember_extracts_keywords_when_none_provided(self, service):
        req = FragmentCreate(
            content="Redis cluster failed during peak load.",
            topic="infra",
            type=FragmentType.ERROR,
        )
        result = service.remember(req)
        assert len(result.keywords) > 0

    def test_remember_uses_provided_keywords(self, service):
        req = FragmentCreate(
            content="Test content.",
            topic="test",
            type=FragmentType.DECISION,
            keywords=["custom", "keywords"],
        )
        result = service.remember(req)
        assert "custom" in result.keywords
        assert "keywords" in result.keywords

    def test_importance_defaults_by_type(self, service):
        expected = {
            FragmentType.ERROR: 0.9,
            FragmentType.PREFERENCE: 0.95,
            FragmentType.SOLUTION_APPROACH: 0.85,
            FragmentType.DECISION: 0.7,
            FragmentType.PROCEDURE: 0.65,
            FragmentType.CLIENT_PATTERN: 0.6,
        }
        for ftype, expected_importance in expected.items():
            req = FragmentCreate(content="Test.", topic="test", type=ftype)
            result = service.remember(req)
            assert result.importance == expected_importance, f"Failed for {ftype}"


class TestRecall:
    def test_recall_l1_hit(self, service):
        service.remember(FragmentCreate(
            content="Redis memory OOM.", topic="infra", type=FragmentType.ERROR,
            keywords=["redis", "oom"],
        ))
        req = RecallRequest(keywords=["redis"], token_budget=1000)
        result = service.recall(req)
        assert isinstance(result, RecallResponse)
        assert result.success is True
        assert any("L1" in path for path in result.search_path)
        assert len(result.fragments) >= 1

    def test_recall_l2_fallback(self, service):
        service.remember(FragmentCreate(
            content="Auth service failing.", topic="auth", type=FragmentType.ERROR,
        ))
        req = RecallRequest(topic="auth", token_budget=1000)
        result = service.recall(req)
        assert result.success is True
        assert any("L2" in path for path in result.search_path)

    def test_recall_empty_results_on_no_match(self, service):
        req = RecallRequest(keywords=["absolutely_nonexistent_xyz"], token_budget=500)
        result = service.recall(req)
        assert result.success is True
        assert result.fragments == []

    def test_recall_respects_token_budget(self, service):
        for i in range(5):
            service.remember(FragmentCreate(
                content="A" * 400,  # ~100 tokens each
                topic="bulk",
                type=FragmentType.DECISION,
                keywords=["bulk"],
            ))
        req = RecallRequest(keywords=["bulk"], token_budget=150)
        result = service.recall(req)
        assert result.total_tokens <= 150

    def test_recall_deduplicates_results(self, service):
        service.remember(FragmentCreate(
            content="Redis failure.", topic="infra", type=FragmentType.ERROR,
            keywords=["redis", "failure"],
        ))
        # Query with two keywords that match the same fragment
        req = RecallRequest(keywords=["redis", "failure"], token_budget=2000)
        result = service.recall(req)
        ids = [f.id for f in result.fragments]
        assert len(ids) == len(set(ids))  # No duplicates

    def test_recall_increments_reference_count(self, service):
        frag = service.remember(FragmentCreate(
            content="Ref count test.", topic="test", type=FragmentType.DECISION,
            keywords=["refcount"],
        ))
        req = RecallRequest(keywords=["refcount"], token_budget=500)
        service.recall(req)
        result = service.recall(req)
        # Verify at least one reference count increment happened
        for f in result.fragments:
            if f.id == frag.id:
                assert f.reference_count >= 1

    def test_recall_includes_query_time(self, service):
        service.remember(FragmentCreate(
            content="Test timing.", topic="perf", type=FragmentType.PROCEDURE,
            keywords=["timing"],
        ))
        req = RecallRequest(keywords=["timing"], token_budget=500)
        result = service.recall(req)
        assert result.query_time_ms >= 0


class TestForget:
    def test_forget_existing(self, service):
        frag = service.remember(FragmentCreate(
            content="To be forgotten.", topic="temp", type=FragmentType.DECISION,
        ))
        assert service.forget(frag.id) is True

    def test_forget_nonexistent_returns_false(self, service):
        assert service.forget("frag_nonexistent") is False


class TestLink:
    def test_link_creates_relationship(self, service, error_fragment, solution_fragment):
        req = LinkCreate(
            from_id=error_fragment.id,
            to_id=solution_fragment.id,
            relation_type=LinkRelationType.RESOLVED_BY,
        )
        link = service.link(req)
        assert link.from_id == error_fragment.id
        assert link.to_id == solution_fragment.id
        assert link.relation_type == LinkRelationType.RESOLVED_BY
        assert link.id.startswith("link_")


class TestGetStats:
    def test_stats_shape(self, service):
        service.remember(FragmentCreate(
            content="Stats test.", topic="analytics", type=FragmentType.ERROR
        ))
        stats = service.get_stats()
        assert stats.total_fragments >= 1
        assert isinstance(stats.by_type, dict)
        assert isinstance(stats.by_tier, dict)
        assert isinstance(stats.by_topic, dict)
